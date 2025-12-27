import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { updateCartTotals, isCouponValid } from "@/lib/cartHelpers";
import { NotFoundError, handleError } from "@/lib/errors";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { cartId, couponCode } = await req.json();

    if (!cartId || !couponCode) {
      throw new Error("cartId and couponCode are required");
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    if (cart.userId !== req.user.userId) {
      throw new Error("Unauthorized to modify this cart");
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          error: "Invalid coupon code",
          message: "The coupon code you entered is invalid",
        },
        { status: 400 }
      );
    }

    const isValid = isCouponValid(coupon, Number(cart.subtotal));

    if (!isValid) {
      if (coupon.currentUses >= coupon.maxUses) {
        return NextResponse.json(
          {
            error: "Coupon limit reached",
            message: "This coupon has reached its maximum usage limit",
          },
          { status: 400 }
        );
      }

      if (new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          {
            error: "Coupon expired",
            message: "This coupon has expired",
          },
          { status: 400 }
        );
      }

      if (Number(cart.subtotal) < Number(coupon.minOrderAmount)) {
        return NextResponse.json(
          {
            error: "Minimum order amount not met",
            message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
          },
          { status: 400 }
        );
      }
    }

    await updateCartTotals(cartId, couponCode.toUpperCase());

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartId },
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
