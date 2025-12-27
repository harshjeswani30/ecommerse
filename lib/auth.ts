import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { JWTPayload, AuthTokens, UserResponse, AuthenticatedUser } from './types'
import { AuthenticationError, AuthorizationError } from './errors'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h'
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION } as jwt.SignOptions)
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION } as jwt.SignOptions)
}

export function generateTokens(user: { id: string; email: string; role: string }): AuthTokens {
  return {
    accessToken: generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    }),
    refreshToken: generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    }),
  }
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    throw new AuthenticationError('Invalid or expired token')
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export async function getUserFromToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        staffPermissions: true,
      },
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      staffPermissions: user.staffPermissions
        ? {
            id: user.staffPermissions.id,
            staffId: user.staffPermissions.staffId,
            canAddProducts: user.staffPermissions.canAddProducts,
            canEditProducts: user.staffPermissions.canEditProducts,
            canDeleteProducts: user.staffPermissions.canDeleteProducts,
            canManageCategories: user.staffPermissions.canManageCategories,
            assignedCategories: user.staffPermissions.assignedCategories as string[],
          }
        : null,
    }
  } catch {
    return null
  }
}

export function sanitizeUser(user: {
  id: string
  email: string
  name: string
  role: string
  phone?: string | null
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any,
    phone: user.phone || null,
  }
}

export function requireAuth(user: AuthenticatedUser | null | undefined): asserts user is AuthenticatedUser {
  if (!user) {
    throw new AuthenticationError('Authentication required')
  }
}

export function requireRole(user: AuthenticatedUser | null | undefined, allowedRoles: string[]): asserts user is AuthenticatedUser {
  requireAuth(user)
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
  }
}

export function requireOwner(user: AuthenticatedUser | null | undefined): asserts user is AuthenticatedUser {
  requireRole(user, ['OWNER'])
}

export function requireStaff(user: AuthenticatedUser | null | undefined): asserts user is AuthenticatedUser {
  requireRole(user, ['OWNER', 'STAFF'])
}

export function requireCustomer(user: AuthenticatedUser | null | undefined): asserts user is AuthenticatedUser {
  requireRole(user, ['CUSTOMER'])
}
