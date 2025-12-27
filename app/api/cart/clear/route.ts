import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { clearCart } from "@/lib/orderHelpers";
import { handleError } from "@/lib/errors";

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
    });

    if (!cart) {
      return NextResponse.json({
        message: "Cart not found",
      });
    }

    await clearCart(cart.id);

    const clearedCart = await prisma.cart.findUnique({
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

    return NextResponse.json({
      message: "Cart cleared successfully",
      cart: clearedCart,
    });
  } catch (error) {
    return handleError(error);
  }
});
