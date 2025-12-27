import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { productId } = await req.json();

    if (!productId) {
      throw new Error("productId is required");
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.userId },
      include: { products: true },
    });

    if (!wishlist) {
      return NextResponse.json({ inWishlist: false });
    }

    const inWishlist = wishlist.products.some((p) => p.id === productId);

    return NextResponse.json({ inWishlist });
  } catch (error) {
    return handleError(error);
  }
});
