import { UserRole } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface StaffPermission {
  id: string;
  staffId: string;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canManageCategories: boolean;
  assignedCategories: string[]; // Category IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}
