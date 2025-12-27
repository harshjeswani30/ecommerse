import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { validateStockUpdate } from "@/lib/validation";
import { authMiddleware } from "@/lib/middleware";
import { checkStaffPermission } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    if (!product) {
      return Response.json(
        { error: "Not Found", message: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({
      productId: product.id,
      productName: product.name,
      stock: product.stock,
    });
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

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return Response.json(
        { error: "Not Found", message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to edit products
    await checkStaffPermission(user.userId, "canEditProducts", product.categoryId);

    const validatedData = validateStockUpdate(body);

    let newStock: number;
    switch (validatedData.action) {
      case "set":
        newStock = validatedData.quantity;
        break;
      case "add":
        newStock = product.stock + validatedData.quantity;
        break;
      case "subtract":
        newStock = product.stock - validatedData.quantity;
        if (newStock < 0) {
          throw new ValidationError("Stock cannot be negative");
        }
        break;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    return Response.json({
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      previousStock: product.stock,
      newStock: updatedProduct.stock,
      action: validatedData.action,
      quantity: validatedData.quantity,
    });
  } catch (error) {
    return handleError(error);
  }
}
