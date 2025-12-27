import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { getOrCreateCart, getCartWithDetails } from "@/lib/cartHelpers";
import { handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const cart = await getCartWithDetails(req.user.userId);

    if (!cart) {
      return NextResponse.json({
        id: "",
        userId: req.user.userId,
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        couponCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    return NextResponse.json(cart);
  } catch (error) {
    return handleError(error);
  }
});
