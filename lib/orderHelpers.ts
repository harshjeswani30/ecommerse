import { prisma } from "./prisma";
import { OrderStatus } from "@prisma/client";
import { OrderTimeline } from "./types";

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${timestamp}${random}`;
};

export const getOrderTimeline = (order: any): OrderTimeline[] => {
  const timeline: OrderTimeline[] = [];

  timeline.push({
    status: "PENDING",
    timestamp: order.createdAt,
    note: "Order placed successfully",
  });

  if (order.status !== "PENDING") {
    timeline.push({
      status: "PACKED",
      timestamp: order.updatedAt,
      note: "Order packed and ready for shipment",
    });
  }

  if (order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED") {
    timeline.push({
      status: "SHIPPED",
      timestamp: order.updatedAt,
      note: "Order shipped from warehouse",
    });
  }

  if (order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED") {
    timeline.push({
      status: "OUT_FOR_DELIVERY",
      timestamp: order.updatedAt,
      note: "Order out for delivery",
    });
  }

  if (order.status === "DELIVERED") {
    timeline.push({
      status: "DELIVERED",
      timestamp: order.updatedAt,
      note: "Order delivered successfully",
    });
  }

  if (order.status === "CANCELLED") {
    timeline.push({
      status: "CANCELLED",
      timestamp: order.updatedAt,
      note: "Order cancelled",
    });
  }

  return timeline;
};

export const calculateRefund = async (orderId: string): Promise<number> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return 0;
  }

  return Number(order.total);
};

export const validateCheckout = async (userId: string, cartId: string, addressId: string): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true },
  });

  if (!cart) {
    errors.push("Cart not found");
    return { isValid: false, errors };
  }

  if (cart.userId !== userId) {
    errors.push("Cart does not belong to user");
    return { isValid: false, errors };
  }

  if (cart.items.length === 0) {
    errors.push("Cart is empty");
    return { isValid: false, errors };
  }

  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    errors.push("Address not found");
    return { isValid: false, errors };
  }

  if (address.userId !== userId) {
    errors.push("Address does not belong to user");
    return { isValid: false, errors };
  }

  for (const item of cart.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      errors.push(`Product ${item.productId} not found`);
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const reserveStock = async (cartId: string): Promise<void> => {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
  });

  for (const item of cartItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }
};

export const restoreStock = async (orderId: string): Promise<void> => {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
  });

  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }
};

export const clearCart = async (cartId: string): Promise<void> => {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      couponCode: null,
    },
  });
};

export const createOrderItems = async (orderId: string, cartId: string): Promise<void> => {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
  });

  for (const cartItem of cartItems) {
    const price = cartItem.product?.discountPrice || cartItem.product?.price || 0;

    await prisma.orderItem.create({
      data: {
        orderId,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        selectedSize: cartItem.selectedSize,
        selectedColor: cartItem.selectedColor,
        priceAtPurchase: Number(price),
      },
    });
  }
};
