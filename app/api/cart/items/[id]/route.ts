import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { validateUpdateCartItem } from "@/lib/validation";
import { updateCartTotals } from "@/lib/cartHelpers";
import { NotFoundError, handleError } from "@/lib/errors";

export const PUT = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const cartItemId = context.params.id;

    const body = await req.json();
    const validatedData = validateUpdateCartItem(body);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    if (cartItem.cart.userId !== req.user.userId) {
      throw new Error("Unauthorized to update this item");
    }

    if (cartItem.product && cartItem.product.stock < validatedData.quantity) {
      throw new Error(`Insufficient stock. Available: ${cartItem.product.stock}`);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: validatedData.quantity },
    });

    await updateCartTotals(cartItem.cartId, cartItem.cart.couponCode);

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    return handleError(error);
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const cartItemId = context.params.id;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    if (cartItem.cart.userId !== req.user.userId) {
      throw new Error("Unauthorized to remove this item");
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    await updateCartTotals(cartItem.cartId, cartItem.cart.couponCode);

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    return handleError(error);
  }
});
