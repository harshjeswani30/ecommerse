import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, getUserFromToken } from './auth'
import type { AuthenticatedUser } from './types'

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser
}

export async function authMiddleware(req: AuthenticatedRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader || undefined)

  if (token) {
    const user = await getUserFromToken(token)
    if (user) {
      req.user = user
    }
  }

  return NextResponse.next()
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredRoles?: string[]
) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      return NextResponse.json(
        { error: 'AuthenticationError', message: 'No token provided', statusCode: 401 },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'AuthenticationError', message: 'Invalid or expired token', statusCode: 401 },
        { status: 401 }
      )
    }

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        return NextResponse.json(
          {
            error: 'AuthorizationError',
            message: `Access denied. Required role: ${requiredRoles.join(' or ')}`,
            statusCode: 403,
          },
          { status: 403 }
        )
      }
    }

    req.user = user
    return handler(req)
  }
}

export function optionalAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (token) {
      const user = await getUserFromToken(token)
      if (user) {
        req.user = user
      }
    }

    return handler(req)
  }
}

export function createAuthContext(user: AuthenticatedUser | null): Record<string, any> {
  if (!user) {
    return { user: null, isAuthenticated: false }
  }

  return {
    user,
    isAuthenticated: true,
    isOwner: user.role === 'OWNER',
    isStaff: user.role === 'OWNER' || user.role === 'STAFF',
    isCustomer: user.role === 'CUSTOMER',
    permissions: user.staffPermissions
      ? {
          canAddProducts: user.staffPermissions.canAddProducts,
          canEditProducts: user.staffPermissions.canEditProducts,
          canDeleteProducts: user.staffPermissions.canDeleteProducts,
          canManageCategories: user.staffPermissions.canManageCategories,
        }
      : null,
  }
}
