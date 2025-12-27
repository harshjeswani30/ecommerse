import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { formatProductsResponse } from "@/lib/productHelpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;

    // For MVP, we'll determine trending by order count
    // We'll get products with the most order items
    const products = await prisma.product.findMany({
      where: category ? { categoryId: category } : undefined,
      include: {
        category: true,
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: [
        { orderItems: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    // If there are no orders yet, fallback to newest products with good stock
    if (products.every((p) => p._count.orderItems === 0)) {
      const fallbackProducts = await prisma.product.findMany({
        where: {
          ...(category && { categoryId: category }),
          stock: { gt: 0 },
        },
        include: {
          category: true,
        },
        orderBy: [
          { stock: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });

      return Response.json({
        products: formatProductsResponse(fallbackProducts),
        count: fallbackProducts.length,
        note: "Showing products with good stock as trending data is not yet available",
      });
    }

    return Response.json({
      products: formatProductsResponse(products),
      count: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
