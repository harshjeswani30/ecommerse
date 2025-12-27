import { UserRole, Season, OrderStatus, PaymentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Decimal | number;
  discountPrice: Decimal | number | null;
  categoryId: string;
  season: Season;
  stock: number;
  images: string[];
  sizes: string[];
  colors: string[];
  fabric: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  createdBy?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilter {
  category?: string;
  season?: Season;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  inStock?: boolean;
  sortBy?: "price" | "newest" | "popularity";
  page?: number;
  limit?: number;
  search?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}
