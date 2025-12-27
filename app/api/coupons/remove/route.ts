import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { updateCartTotals } from "@/lib/cartHelpers";
import { NotFoundError, handleError } from "@/lib/errors";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      throw new Error("cartId is required");
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

    await updateCartTotals(cartId, null);

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
