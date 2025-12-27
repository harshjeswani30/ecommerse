import { UserRole } from "@prisma/client";
import { JWTPayload } from "./types";
import { prisma } from "./prisma";
import { AuthorizationError } from "./errors";

export const checkRole = (user: JWTPayload, allowedRoles: UserRole[]) => {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError("You do not have permission to perform this action");
  }
};

export const isOwner = (user: JWTPayload) => {
  checkRole(user, [UserRole.OWNER]);
};

export const isStaff = (user: JWTPayload) => {
  checkRole(user, [UserRole.OWNER, UserRole.STAFF]);
};

export const isCustomer = (user: JWTPayload) => {
  checkRole(user, [UserRole.CUSTOMER]);
};

export const checkStaffPermission = async (
  userId: string,
  permission: "canAddProducts" | "canEditProducts" | "canDeleteProducts" | "canManageCategories",
  categoryId?: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { staffPermissions: true },
  });

  if (!user) throw new AuthorizationError("User not found");
  if (user.role === UserRole.OWNER) return true; // Owner has all permissions
  if (user.role !== UserRole.STAFF) throw new AuthorizationError("User is not a staff member");

  const permissions = user.staffPermissions;
  if (!permissions) throw new AuthorizationError("Staff permissions not found");

  if (!permissions[permission]) {
    throw new AuthorizationError(`Staff does not have ${permission} permission`);
  }

  if (categoryId && permissions.assignedCategories) {
    const assignedCategories = permissions.assignedCategories as string[];
    if (assignedCategories.length > 0 && !assignedCategories.includes(categoryId)) {
      throw new AuthorizationError("Staff is not assigned to this category");
    }
  }

  return true;
};
