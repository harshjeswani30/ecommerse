import { prisma } from "./prisma";
import { CartCalculation, Coupon } from "./types";
import { ValidationError } from "./errors";

const GST_RATE = 0.18; // 18% GST

export const calculateCartTotal = async (cartId: string): Promise<CartCalculation> => {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
  });

  let subtotal = 0;

  for (const item of cartItems) {
    const price = item.product?.discountPrice || item.product?.price || 0;
    subtotal += Number(price) * item.quantity;
  }

  const tax = subtotal * GST_RATE;
  const discount = 0;
  const total = subtotal + tax - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

export const calculateTax = (amount: number): number => {
  return Math.round(amount * GST_RATE * 100) / 100;
};

export const calculateDiscount = (subtotal: number, coupon: any): number => {
  let discount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discount = subtotal * (Number(coupon.discountValue) / 100);
  } else {
    discount = Number(coupon.discountValue);
  }

  return Math.round(discount * 100) / 100;
};

export const calculateFinalTotal = (subtotal: number, discount: number): number => {
  const tax = calculateTax(subtotal);
  const total = subtotal + tax - discount;
  return Math.round(total * 100) / 100;
};

export const validateStock = async (cartId: string): Promise<{ isValid: boolean; outOfStockItems: any[] }> => {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
  });

  const outOfStockItems: any[] = [];

  for (const item of cartItems) {
    if (!item.product) {
      outOfStockItems.push({
        cartItemId: item.id,
        productId: item.productId,
        reason: "Product not found",
      });
      continue;
    }

    if (item.product.stock < item.quantity) {
      outOfStockItems.push({
        cartItemId: item.id,
        productId: item.productId,
        productName: item.product.name,
        requestedQuantity: item.quantity,
        availableStock: item.product.stock,
      });
    }
  }

  return {
    isValid: outOfStockItems.length === 0,
    outOfStockItems,
  };
};

export const updateCartTotals = async (cartId: string, couponCode?: string | null): Promise<void> => {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
  });

  let subtotal = 0;

  for (const item of cartItems) {
    const price = item.product?.discountPrice || item.product?.price || 0;
    subtotal += Number(price) * item.quantity;
  }

  const tax = calculateTax(subtotal);
  let discount = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (coupon && isCouponValid(coupon, subtotal)) {
      discount = calculateDiscount(subtotal, coupon);
    }
  }

  const total = subtotal + tax - discount;

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal,
      tax,
      discount,
      total,
      couponCode,
    },
  });
};

export const isCouponValid = (coupon: any, cartTotal: number): boolean => {
  if (!coupon) {
    return false;
  }

  if (coupon.currentUses >= coupon.maxUses) {
    return false;
  }

  if (new Date(coupon.expiresAt) < new Date()) {
    return false;
  }

  if (cartTotal < Number(coupon.minOrderAmount)) {
    return false;
  }

  return true;
};

export const getOrCreateCart = async (userId: string): Promise<any> => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  return cart;
};

export const getCartWithDetails = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return cart;
};
