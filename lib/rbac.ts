import type { AuthenticatedUser, StaffPermissionData } from './types'
import { AuthorizationError } from './errors'

export type StaffRole = 'STAFF' | 'MANAGER' | 'ADMIN'

export interface PermissionCheck {
  canAddProducts: boolean
  canEditProducts: boolean
  canDeleteProducts: boolean
  canManageCategories: boolean
  canManageStaff: boolean
  canViewOrders: boolean
  canManageOrders: boolean
  canViewAnalytics: boolean
}

export const OWNER_PERMISSIONS: PermissionCheck = {
  canAddProducts: true,
  canEditProducts: true,
  canDeleteProducts: true,
  canManageCategories: true,
  canManageStaff: true,
  canViewOrders: true,
  canManageOrders: true,
  canViewAnalytics: true,
}

export function getStaffPermissions(user: AuthenticatedUser): PermissionCheck | null {
  if (user.role === 'OWNER') {
    return OWNER_PERMISSIONS
  }

  if (user.role !== 'STAFF' || !user.staffPermissions) {
    return null
  }

  const perms = user.staffPermissions
  return {
    canAddProducts: perms.canAddProducts,
    canEditProducts: perms.canEditProducts,
    canDeleteProducts: perms.canDeleteProducts,
    canManageCategories: perms.canManageCategories,
    canManageStaff: false,
    canViewOrders: true,
    canManageOrders: false,
    canViewAnalytics: false,
  }
}

export function canPerformAction(
  user: AuthenticatedUser,
  action: keyof PermissionCheck
): boolean {
  const permissions = getStaffPermissions(user)
  if (!permissions) {
    return false
  }
  return permissions[action]
}

export function canManageProduct(
  user: AuthenticatedUser,
  action: 'add' | 'edit' | 'delete',
  categoryId?: string
): boolean {
  if (user.role === 'OWNER') {
    return true
  }

  if (user.role !== 'STAFF' || !user.staffPermissions) {
    return false
  }

  const permissionMap = {
    add: 'canAddProducts',
    edit: 'canEditProducts',
    delete: 'canDeleteProducts',
  }

  const hasPermission = user.staffPermissions[permissionMap[action] as keyof StaffPermissionData]
  if (!hasPermission) {
    return false
  }

  if (categoryId && user.staffPermissions.assignedCategories.length > 0) {
    return user.staffPermissions.assignedCategories.includes(categoryId)
  }

  return true
}

export function canManageCategory(user: AuthenticatedUser, categoryId?: string): boolean {
  if (user.role === 'OWNER') {
    return true
  }

  if (user.role !== 'STAFF' || !user.staffPermissions) {
    return false
  }

  if (!user.staffPermissions.canManageCategories) {
    return false
  }

  if (categoryId && user.staffPermissions.assignedCategories.length > 0) {
    return user.staffPermissions.assignedCategories.includes(categoryId)
  }

  return true
}

export function requirePermission(user: AuthenticatedUser | null, permission: keyof PermissionCheck): void {
  if (!user) {
    throw new AuthorizationError('Authentication required')
  }

  if (!canPerformAction(user, permission)) {
    throw new AuthorizationError(`Missing required permission: ${permission}`)
  }
}

export function requireProductPermission(
  user: AuthenticatedUser | null,
  action: 'add' | 'edit' | 'delete',
  categoryId?: string
): void {
  if (!user) {
    throw new AuthorizationError('Authentication required')
  }

  if (!canManageProduct(user, action, categoryId)) {
    throw new AuthorizationError(`Cannot ${action} products in this category`)
  }
}

export function requireCategoryPermission(user: AuthenticatedUser | null, categoryId?: string): void {
  if (!user) {
    throw new AuthorizationError('Authentication required')
  }

  if (!canManageCategory(user, categoryId)) {
    throw new AuthorizationError('Cannot manage this category')
  }
}

export function getAccessibleCategories(user: AuthenticatedUser): string[] {
  if (user.role === 'OWNER') {
    return []
  }

  if (user.role !== 'STAFF' || !user.staffPermissions) {
    return []
  }

  return user.staffPermissions.assignedCategories
}

export function isOwner(user: AuthenticatedUser): boolean {
  return user.role === 'OWNER'
}

export function isStaff(user: AuthenticatedUser): boolean {
  return user.role === 'OWNER' || user.role === 'STAFF'
}

export function isCustomer(user: AuthenticatedUser): boolean {
  return user.role === 'CUSTOMER'
}
