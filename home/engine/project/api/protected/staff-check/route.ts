import { NextResponse } from 'next/server'
import { getUserFromToken, extractTokenFromHeader } from '@/lib/auth'
import { AuthorizationError, AuthenticationError } from '@/lib/errors'
import { canPerformAction, getStaffPermissions } from '@/lib/rbac'
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

    if (user.role !== 'STAFF' && user.role !== 'OWNER') {
      throw new AuthorizationError('Access denied. Staff access required')
    }

    const permissions = getStaffPermissions(user)

    return NextResponse.json({
      success: true,
      data: {
        isStaff: true,
        role: user.role,
        permissions: permissions,
        assignedCategories: user.staffPermissions?.assignedCategories || [],
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
