import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { authMiddleware } from "@/lib/middleware";
import { checkStaffPermission } from "@/lib/rbac";

export async function POST(
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

    if (!body.imageUrl || typeof body.imageUrl !== "string") {
      throw new ValidationError("Image URL is required");
    }

    // Validate URL format (basic validation)
    try {
      new URL(body.imageUrl);
    } catch {
      throw new ValidationError("Invalid image URL format");
    }

    // Add image to existing images
    const currentImages = product.images as string[];
    const updatedImages = [...currentImages, body.imageUrl];

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { images: updatedImages },
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    return Response.json({
      message: "Image added successfully",
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        images: updatedProduct.images,
      },
    });
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
    const { searchParams } = new URL(req.url);

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

    const imageUrl = searchParams.get("imageUrl");
    const imageIndex = searchParams.get("imageIndex");

    if (!imageUrl && !imageIndex) {
      throw new ValidationError("Either imageUrl or imageIndex is required");
    }

    const currentImages = product.images as string[];

    if (currentImages.length <= 1) {
      throw new ValidationError("Cannot remove the last image. Product must have at least one image.");
    }

    let updatedImages: string[];

    if (imageUrl) {
      updatedImages = currentImages.filter((img) => img !== imageUrl);
      if (updatedImages.length === currentImages.length) {
        throw new ValidationError("Image URL not found in product images");
      }
    } else if (imageIndex) {
      const index = parseInt(imageIndex);
      if (isNaN(index) || index < 0 || index >= currentImages.length) {
        throw new ValidationError("Invalid image index");
      }
      updatedImages = currentImages.filter((_, i) => i !== index);
    } else {
      throw new ValidationError("Invalid request");
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { images: updatedImages },
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    return Response.json({
      message: "Image removed successfully",
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        images: updatedProduct.images,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
