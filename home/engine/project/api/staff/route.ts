import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateTokens, sanitizeUser, requireOwner } from '@/lib/auth'
import { getUserFromToken, extractTokenFromHeader } from '@/lib/auth'
import { ValidationError, ConflictError, AuthorizationError, NotFoundError } from '@/lib/errors'
import type { CreateStaffInput } from '@/lib/types'
import type { AuthenticatedRequest } from '@/lib/middleware'

export async function GET(request: AuthenticatedRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    const user = await getUserFromToken(token)
    requireOwner(user)

    const staffMembers = await prisma.user.findMany({
      where: { role: 'STAFF' },
      include: {
        staffPermissions: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: staffMembers.map((staff) => ({
        ...sanitizeUser(staff),
        permissions: staff.staffPermissions
          ? {
              canAddProducts: staff.staffPermissions.canAddProducts,
              canEditProducts: staff.staffPermissions.canEditProducts,
              canDeleteProducts: staff.staffPermissions.canDeleteProducts,
              canManageCategories: staff.staffPermissions.canManageCategories,
              assignedCategories: staff.staffPermissions.assignedCategories,
            }
          : null,
      })),
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'

    return NextResponse.json(
      { error: error.name || 'Error', message, statusCode },
      { status: statusCode }
    )
  }
}

export async function POST(request: AuthenticatedRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    const user = await getUserFromToken(token)
    requireOwner(user)

    const body: CreateStaffInput = await request.json()
    const { email, name, role } = body

    if (!email || !name) {
      throw new ValidationError('Email and name are required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    const tempPassword = Math.random().toString(36).slice(-12)
    const hashedPassword = await hashPassword(tempPassword)

    const staffMember = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'STAFF',
      },
    })

    const defaultPermissions = await prisma.staffPermission.create({
      data: {
        staffId: staffMember.id,
        canAddProducts: false,
        canEditProducts: false,
        canDeleteProducts: false,
        canManageCategories: false,
        assignedCategories: [],
      },
    })

    const tokens = generateTokens({
      id: staffMember.id,
      email: staffMember.email,
      role: staffMember.role,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: sanitizeUser(staffMember),
        permissions: {
          canAddProducts: defaultPermissions.canAddProducts,
          canEditProducts: defaultPermissions.canEditProducts,
          canDeleteProducts: defaultPermissions.canDeleteProducts,
          canManageCategories: defaultPermissions.canManageCategories,
          assignedCategories: defaultPermissions.assignedCategories,
        },
        ...tokens,
      },
      message: 'Staff account created successfully. They should change their temporary password on first login.',
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'

    return NextResponse.json(
      { error: error.name || 'Error', message, statusCode },
      { status: statusCode }
    )
  }
}
