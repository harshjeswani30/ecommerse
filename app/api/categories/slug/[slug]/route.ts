import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return Response.json(
        { error: "Not Found", message: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json({ category });
  } catch (error) {
    return handleError(error);
  }
}
