import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { validatePaginationParams } from "@/lib/validation";
import { buildProductFilter, buildProductSort, filterProductsBySizesAndColors, formatProductsResponse } from "@/lib/productHelpers";
import { Season } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const { page, limit } = validatePaginationParams(
      searchParams.get("page") || undefined,
      searchParams.get("limit") || undefined
    );

    // Parse array parameters
    const sizesParam = searchParams.get("sizes");
    const colorsParam = searchParams.get("colors");

    const sizes = sizesParam ? sizesParam.split(",").map((s) => s.trim()) : undefined;
    const colors = colorsParam ? colorsParam.split(",").map((c) => c.trim()) : undefined;

    const filters = {
      category: searchParams.get("category") || undefined,
      season: searchParams.get("season") as Season | undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      fabric: searchParams.get("fabric") || undefined,
      inStock: searchParams.get("inStock") === "true",
      sortBy: (searchParams.get("sortBy") as "price" | "newest" | "popularity") || "newest",
      search: searchParams.get("search") || undefined,
    };

    const where = buildProductFilter(filters);
    const orderBy = buildProductSort(filters.sortBy);

    // Fetch products
    let products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
    });

    // Apply size and color filters (JSON field filtering)
    products = filterProductsBySizesAndColors(products, sizes, colors);

    // Calculate pagination
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return Response.json({
      data: formatProductsResponse(paginatedProducts),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      filters: {
        ...filters,
        sizes,
        colors,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
