import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { validateProduct } from "@/lib/validation";
import { authMiddleware } from "@/lib/middleware";
import { isOwner } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    isOwner(user);

    const body = await req.json();

    if (!Array.isArray(body.products)) {
      throw new ValidationError("Request body must contain a 'products' array");
    }

    if (body.products.length === 0) {
      throw new ValidationError("Products array cannot be empty");
    }

    if (body.products.length > 100) {
      throw new ValidationError("Cannot upload more than 100 products at once");
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
    };

    // Process each product in a transaction
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < body.products.length; i++) {
        const productData = body.products[i];

        try {
          // Validate product
          const validatedData = validateProduct(productData);

          // Check if slug already exists
          const existingSlug = await tx.product.findUnique({
            where: { slug: validatedData.slug },
          });

          if (existingSlug) {
            results.errors.push({
              index: i,
              product: productData,
              error: `Product with slug '${validatedData.slug}' already exists`,
            });
            continue;
          }

          // Check if category exists
          const category = await tx.category.findUnique({
            where: { id: validatedData.categoryId },
          });

          if (!category) {
            results.errors.push({
              index: i,
              product: productData,
              error: `Category not found: ${validatedData.categoryId}`,
            });
            continue;
          }

          // Create product
          const product = await tx.product.create({
            data: {
              ...validatedData,
              createdById: user.userId,
            },
            include: {
              category: true,
            },
          });

          results.success.push({
            index: i,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
            },
          });
        } catch (error: any) {
          results.errors.push({
            index: i,
            product: productData,
            error: error.message || "Validation failed",
          });
        }
      }
    });

    return Response.json({
      message: "Bulk upload completed",
      summary: {
        total: body.products.length,
        successful: results.success.length,
        failed: results.errors.length,
      },
      results,
    });
  } catch (error) {
    return handleError(error);
  }
}
