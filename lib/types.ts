import { UserRole, Season, OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

export type Decimal = Prisma.Decimal | number;

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

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  product?: Product;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  deliveryAddressId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  deliveryAddress: Address;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  priceAtPurchase: number;
  product?: Product;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  currentUses: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface ApplyCouponRequest {
  cartId: string;
  couponCode: string;
}

export interface CreateOrderRequest {
  cartId?: string;
  deliveryAddressId: string;
  paymentMethod: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface CartCalculation {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}
