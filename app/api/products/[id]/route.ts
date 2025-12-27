import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { validateProduct } from "@/lib/validation";
import { authMiddleware } from "@/lib/middleware";
import { checkStaffPermission } from "@/lib/rbac";
import { formatProductResponse } from "@/lib/productHelpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authMiddleware(req);
    const { id } = await params;
    const body = await req.json();

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return Response.json(
        { error: "Not Found", message: "Product not found" },
        { status: 404 }
      );
    }

    const validatedData = validateProduct(body);

    // Check if user has permission to edit products
    await checkStaffPermission(user.userId, "canEditProducts", validatedData.categoryId);

    // Check if new slug conflicts with another product
    if (validatedData.slug !== existingProduct.slug) {
      const slugConflict = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugConflict) {
        throw new ValidationError("Product with this slug already exists");
      }
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      throw new ValidationError("Category not found");
    }

    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
      },
    });

    return Response.json({ product: formatProductResponse(product) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authMiddleware(req);
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return Response.json(
        { error: "Not Found", message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to delete products
    await checkStaffPermission(user.userId, "canDeleteProducts", product.categoryId);

    await prisma.product.delete({
      where: { id },
    });

    return Response.json({ message: "Product deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}
