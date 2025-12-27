import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { formatProductResponse } from "@/lib/productHelpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return Response.json(
        { error: "Not Found", message: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({ product: formatProductResponse(product) });
  } catch (error) {
    return handleError(error);
  }
}
