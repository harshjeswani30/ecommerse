import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.userId },
      include: {
        products: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json({
        id: "",
        userId: req.user.userId,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { productId } = await req.json();

    if (!productId) {
      throw new Error("productId is required");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.userId },
      include: { products: true },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: req.user.userId,
          products: {
            connect: { id: productId },
          },
        },
        include: { products: { include: { category: true } } },
      });
    } else {
      const isAlreadyInWishlist = wishlist.products.some((p) => p.id === productId);

      if (isAlreadyInWishlist) {
        return NextResponse.json(wishlist, {
          status: 200,
        });
      }

      wishlist = await prisma.wishlist.update({
        where: { id: wishlist.id },
        data: {
          products: {
            connect: { id: productId },
          },
        },
        include: {
          products: {
            include: { category: true },
          },
        },
      });
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    return handleError(error);
  }
});
