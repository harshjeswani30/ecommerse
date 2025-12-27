import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, extractTokenFromHeader, requireOwner, sanitizeUser } from '@/lib/auth'
import { AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors'
import type { AuthenticatedRequest } from '@/lib/middleware'

export async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    const user = await getUserFromToken(token)
    requireOwner(user)

    const { id } = await params

    const staffMember = await prisma.user.findUnique({
      where: { id, role: 'STAFF' },
      include: {
        staffPermissions: true,
      },
    })

    if (!staffMember) {
      throw new NotFoundError('Staff member not found')
    }

    return NextResponse.json({
      success: true,
      data: {
        user: sanitizeUser(staffMember),
        permissions: staffMember.staffPermissions
          ? {
              id: staffMember.staffPermissions.id,
              canAddProducts: staffMember.staffPermissions.canAddProducts,
              canEditProducts: staffMember.staffPermissions.canEditProducts,
              canDeleteProducts: staffMember.staffPermissions.canDeleteProducts,
              canManageCategories: staffMember.staffPermissions.canManageCategories,
              assignedCategories: staffMember.staffPermissions.assignedCategories,
            }
          : null,
      },
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

export async function PUT(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    const user = await getUserFromToken(token)
    requireOwner(user)

    const { id } = await params
    const body = await request.json()
    const { name, email, isActive } = body

    const existingStaff = await prisma.user.findUnique({
      where: { id, role: 'STAFF' },
    })

    if (!existingStaff) {
      throw new NotFoundError('Staff member not found')
    }

    if (email && email !== existingStaff.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      })
      if (emailInUse) {
        throw new ValidationError('Email already in use', 'email')
      }
    }

    const updateData: Record<string, any> = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedStaff = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: sanitizeUser(updatedStaff),
      },
      message: 'Staff details updated successfully',
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

export async function DELETE(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    const user = await getUserFromToken(token)
    requireOwner(user)

    const { id } = await params

    const staffMember = await prisma.user.findUnique({
      where: { id, role: 'STAFF' },
    })

    if (!staffMember) {
      throw new NotFoundError('Staff member not found')
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff account deleted successfully',
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
