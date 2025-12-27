import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { getAllCategoryIds } from "@/lib/productHelpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return Response.json(
        { error: "Not Found", message: "Category not found" },
        { status: 404 }
      );
    }

    // Get all category IDs including subcategories
    const categoryIds = await getAllCategoryIds(id, prisma);

    // Count products in all these categories
    const productCount = await prisma.product.count({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
    });

    return Response.json({
      categoryId: id,
      categoryName: category.name,
      productCount,
      includesSubcategories: categoryIds.length > 1,
    });
  } catch (error) {
    return handleError(error);
  }
}
