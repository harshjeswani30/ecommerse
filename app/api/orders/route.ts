import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { validateCreateOrder, validatePaginationParams } from "@/lib/validation";
import { validateCheckout, reserveStock, createOrderItems, clearCart } from "@/lib/orderHelpers";
import { generateOrderNumber } from "@/lib/orderHelpers";
import { UserRole } from "@prisma/client";
import { NotFoundError, handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = validatePaginationParams(
      searchParams.get("page") || undefined,
      searchParams.get("limit") || undefined
    );

    let whereClause: any = {};

    if (req.user.role !== UserRole.OWNER) {
      whereClause.userId = req.user.userId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          orderItems: {
            include: { product: { include: { category: true } } },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = validateCreateOrder(body);

    let cartId = validatedData.cartId;

    if (!cartId) {
      const cart = await prisma.cart.findUnique({
        where: { userId: req.user.userId },
      });

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }

      cartId = cart.id;
    }

    const validation = await validateCheckout(req.user.userId, cartId, validatedData.deliveryAddressId);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Order validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    const address = await prisma.address.findUnique({
      where: { id: validatedData.deliveryAddressId },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user.userId,
          deliveryAddressId: validatedData.deliveryAddressId,
          paymentMethod: validatedData.paymentMethod,
          paymentStatus: "PENDING",
          razorpayOrderId: null,
          razorpayPaymentId: null,
          subtotal: cart.subtotal,
          tax: cart.tax,
          discount: cart.discount,
          total: cart.total,
        },
      });

      await createOrderItems(order.id, cartId);

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      if (cart.couponCode) {
        await tx.coupon.update({
          where: { code: cart.couponCode },
          data: {
            currentUses: {
              increment: 1,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId },
      });

      await tx.cart.update({
        where: { id: cartId },
        data: {
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0,
          couponCode: null,
        },
      });

      return order;
    });

    const createdOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: { product: { include: { category: true } } },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
});
