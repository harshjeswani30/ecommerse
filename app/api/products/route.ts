import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { validateProduct, validatePaginationParams } from "@/lib/validation";
import { authMiddleware } from "@/lib/middleware";
import { checkStaffPermission } from "@/lib/rbac";
import { buildProductFilter, buildProductSort, formatProductsResponse } from "@/lib/productHelpers";
import { Season } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const { page, limit } = validatePaginationParams(
      searchParams.get("page") || undefined,
      searchParams.get("limit") || undefined
    );

    const filters = {
      category: searchParams.get("category") || undefined,
      season: searchParams.get("season") as Season | undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      search: searchParams.get("search") || undefined,
    };

    const where = buildProductFilter(filters);
    const orderBy = buildProductSort("newest");

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      data: formatProductsResponse(products),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    const body = await req.json();

    const validatedData = validateProduct(body);

    // Check if user has permission to add products
    await checkStaffPermission(user.userId, "canAddProducts", validatedData.categoryId);

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      throw new ValidationError("Product with this slug already exists");
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      throw new ValidationError("Category not found");
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        createdById: user.userId,
      },
      include: {
        category: true,
      },
    });

    return Response.json(
      { product: formatProductsResponse([product])[0] },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
