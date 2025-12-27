import { NextResponse } from 'next/server'
import { getUserFromToken, extractTokenFromHeader, sanitizeUser } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import type { AuthenticatedRequest } from '@/lib/middleware'

export async function GET(request: AuthenticatedRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const user = await getUserFromToken(token)

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    const userWithPermissions = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        staffPermissions: true,
      },
    })

    if (!userWithPermissions) {
      throw new AuthenticationError('User not found')
    }

    const responseData: any = {
      user: sanitizeUser(userWithPermissions),
    }

    if (userWithPermissions.role === 'STAFF' && userWithPermissions.staffPermissions) {
      responseData.permissions = {
        canAddProducts: userWithPermissions.staffPermissions.canAddProducts,
        canEditProducts: userWithPermissions.staffPermissions.canEditProducts,
        canDeleteProducts: userWithPermissions.staffPermissions.canDeleteProducts,
        canManageCategories: userWithPermissions.staffPermissions.canManageCategories,
        assignedCategories: userWithPermissions.staffPermissions.assignedCategories,
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
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
