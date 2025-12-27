import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { formatProductsResponse } from "@/lib/productHelpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        season: true,
      },
    });

    if (!product) {
      return Response.json(
        { error: "Not Found", message: "Product not found" },
        { status: 404 }
      );
    }

    // Find related products: same category, different product, preferably same season
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        OR: [
          { season: product.season },
          { season: "ALL" },
        ],
      },
      include: {
        category: true,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // If we don't have enough, get more from the same category without season filter
    if (relatedProducts.length < limit) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: {
            not: product.id,
            notIn: relatedProducts.map((p) => p.id),
          },
        },
        include: {
          category: true,
        },
        take: limit - relatedProducts.length,
        orderBy: {
          createdAt: "desc",
        },
      });

      relatedProducts.push(...additionalProducts);
    }

    return Response.json({
      productId: id,
      relatedProducts: formatProductsResponse(relatedProducts),
      count: relatedProducts.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
