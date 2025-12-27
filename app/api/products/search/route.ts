import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { sanitizeSearchQuery } from "@/lib/validation";
import { formatProductsResponse } from "@/lib/productHelpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length === 0) {
      throw new ValidationError("Search query is required");
    }

    const sanitizedQuery = sanitizeSearchQuery(query);

    if (sanitizedQuery.length < 2) {
      throw new ValidationError("Search query must be at least 2 characters");
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: sanitizedQuery, mode: "insensitive" } },
          { description: { contains: sanitizedQuery, mode: "insensitive" } },
          { fabric: { contains: sanitizedQuery, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return Response.json({
      query: sanitizedQuery,
      products: formatProductsResponse(products),
      count: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
