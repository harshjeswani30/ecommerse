import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, extractTokenFromHeader, requireOwner } from '@/lib/auth'
import { AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors'
import type { UpdateStaffPermissionsInput } from '@/lib/types'
import type { AuthenticatedRequest } from '@/lib/middleware'

export async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    const user = await getUserFromToken(token)
    requireOwner(user)

    const { staffId } = await params

    const staffMember = await prisma.user.findUnique({
      where: { id: staffId, role: 'STAFF' },
      include: {
        staffPermissions: true,
      },
    })

    if (!staffMember) {
      throw new NotFoundError('Staff member not found')
    }

    if (!staffMember.staffPermissions) {
      return NextResponse.json({
        success: true,
        data: {
          permissions: null,
        },
        message: 'No permissions assigned to this staff member',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        permissions: {
          id: staffMember.staffPermissions.id,
          staffId: staffMember.staffPermissions.staffId,
          canAddProducts: staffMember.staffPermissions.canAddProducts,
          canEditProducts: staffMember.staffPermissions.canEditProducts,
          canDeleteProducts: staffMember.staffPermissions.canDeleteProducts,
          canManageCategories: staffMember.staffPermissions.canManageCategories,
          assignedCategories: staffMember.staffPermissions.assignedCategories,
        },
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
  { params }: { params: Promise<{ staffId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    const user = await getUserFromToken(token)
    requireOwner(user)

    const { staffId } = await params
    const body: UpdateStaffPermissionsInput = await request.json()

    const staffMember = await prisma.user.findUnique({
      where: { id: staffId, role: 'STAFF' },
    })

    if (!staffMember) {
      throw new NotFoundError('Staff member not found')
    }

    let permissions = await prisma.staffPermission.findUnique({
      where: { staffId },
    })

    if (!permissions) {
      permissions = await prisma.staffPermission.create({
        data: {
          staffId,
          canAddProducts: false,
          canEditProducts: false,
          canDeleteProducts: false,
          canManageCategories: false,
          assignedCategories: [],
        },
      })
    }

    const updateData: Record<string, any> = {}

    if (body.canAddProducts !== undefined) updateData.canAddProducts = body.canAddProducts
    if (body.canEditProducts !== undefined) updateData.canEditProducts = body.canEditProducts
    if (body.canDeleteProducts !== undefined) updateData.canDeleteProducts = body.canDeleteProducts
    if (body.canManageCategories !== undefined) updateData.canManageCategories = body.canManageCategories
    if (body.assignedCategories !== undefined) updateData.assignedCategories = body.assignedCategories

    const updatedPermissions = await prisma.staffPermission.update({
      where: { staffId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        permissions: {
          id: updatedPermissions.id,
          staffId: updatedPermissions.staffId,
          canAddProducts: updatedPermissions.canAddProducts,
          canEditProducts: updatedPermissions.canEditProducts,
          canDeleteProducts: updatedPermissions.canDeleteProducts,
          canManageCategories: updatedPermissions.canManageCategories,
          assignedCategories: updatedPermissions.assignedCategories,
        },
      },
      message: 'Permissions updated successfully',
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
