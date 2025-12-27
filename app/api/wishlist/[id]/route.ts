import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";

export const DELETE = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const productId = context.params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.userId },
      include: { products: true },
    });

    if (!wishlist) {
      return NextResponse.json({ message: "Wishlist not found" }, { status: 404 });
    }

    const productExists = wishlist.products.some((p) => p.id === productId);

    if (!productExists) {
      return NextResponse.json({ message: "Product not in wishlist" }, { status: 400 });
    }

    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
      include: {
        products: {
          include: { category: true },
        },
      },
    });

    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: {
        products: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json(updatedWishlist);
  } catch (error) {
    return handleError(error);
  }
});
