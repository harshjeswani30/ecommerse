import { UserRole } from '@prisma/client'

export type { UserRole }

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserResponse {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string | null
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface StaffPermissionData {
  id: string
  staffId: string
  canAddProducts: boolean
  canEditProducts: boolean
  canDeleteProducts: boolean
  canManageCategories: boolean
  assignedCategories: string[]
}

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

export interface SignupInput {
  email: string
  password: string
  name: string
  phone?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface CreateStaffInput {
  email: string
  name: string
  role?: 'STAFF'
}

export interface UpdateStaffPermissionsInput {
  canAddProducts?: boolean
  canEditProducts?: boolean
  canDeleteProducts?: boolean
  canManageCategories?: boolean
  assignedCategories?: string[]
}

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string | null
  staffPermissions?: StaffPermissionData | null
}
