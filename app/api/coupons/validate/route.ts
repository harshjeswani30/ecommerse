import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApplyCoupon } from "@/lib/validation";
import { isCouponValid, calculateDiscount } from "@/lib/cartHelpers";
import { handleError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = validateApplyCoupon(body);

    const coupon = await prisma.coupon.findUnique({
      where: { code: validatedData.couponCode },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          message: "Invalid coupon code",
        },
        { status: 400 }
      );
    }

    const isValid = isCouponValid(coupon, validatedData.cartTotal);

    if (!isValid) {
      if (coupon.currentUses >= coupon.maxUses) {
        return NextResponse.json(
          {
            valid: false,
            message: "Coupon has reached maximum usage limit",
          },
          { status: 400 }
        );
      }

      if (new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          {
            valid: false,
            message: "Coupon has expired",
          },
          { status: 400 }
        );
      }

      if (validatedData.cartTotal < Number(coupon.minOrderAmount)) {
        return NextResponse.json(
          {
            valid: false,
            message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
          },
          { status: 400 }
        );
      }
    }

    const discountAmount = calculateDiscount(validatedData.cartTotal, coupon);

    return NextResponse.json({
      valid: true,
      message: "Coupon applied successfully",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
      },
      discountAmount,
    });
  } catch (error) {
    return handleError(error);
  }
}
