import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, updateCartTotals } from "@/lib/cartHelpers";
import { validateAddToCart } from "@/lib/validation";
import { NotFoundError, handleError } from "@/lib/errors";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = validateAddToCart(body);

    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.stock < validatedData.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }

    const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
    const productColors = Array.isArray(product.colors) ? product.colors : [];

    if (!productSizes.includes(validatedData.selectedSize)) {
      throw new Error(`Invalid size. Available sizes: ${productSizes.join(", ")}`);
    }

    if (!productColors.includes(validatedData.selectedColor)) {
      throw new Error(`Invalid color. Available colors: ${productColors.join(", ")}`);
    }

    const cart = await getOrCreateCart(req.user.userId);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.productId,
        selectedSize: validatedData.selectedSize,
        selectedColor: validatedData.selectedColor,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + validatedData.quantity;

      if (product.stock < newQuantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          selectedSize: validatedData.selectedSize,
          selectedColor: validatedData.selectedColor,
        },
      });
    }

    await updateCartTotals(cart.id, cart.couponCode);

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("cartItemId");

    if (!cartItemId) {
      throw new Error("cartItemId is required");
    }

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
