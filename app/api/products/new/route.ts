import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { formatProductsResponse } from "@/lib/productHelpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;

    const products = await prisma.product.findMany({
      where: category ? { categoryId: category } : undefined,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return Response.json({
      products: formatProductsResponse(products),
      count: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
