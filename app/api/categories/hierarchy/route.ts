import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { buildCategoryHierarchy } from "@/lib/productHelpers";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const hierarchy = buildCategoryHierarchy(categories);

    return Response.json({ hierarchy });
  } catch (error) {
    return handleError(error);
  }
}
