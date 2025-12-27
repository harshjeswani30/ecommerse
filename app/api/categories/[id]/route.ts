import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { validateCategory } from "@/lib/validation";
import { authMiddleware } from "@/lib/middleware";
import { isOwner } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authMiddleware(req);
    isOwner(user);

    const { id } = await params;
    const body = await req.json();

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return Response.json(
        { error: "Not Found", message: "Category not found" },
        { status: 404 }
      );
    }

    const validatedData = validateCategory(body);

    // Check if new slug conflicts with another category
    if (validatedData.slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugConflict) {
        throw new ValidationError("Category with this slug already exists");
      }
    }

    // Check if new name conflicts with another category
    if (validatedData.name !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name: validatedData.name },
      });

      if (nameConflict) {
        throw new ValidationError("Category with this name already exists");
      }
    }

    // If parentId is being changed, validate
    if (validatedData.parentId) {
      // Cannot set parent to itself
      if (validatedData.parentId === id) {
        throw new ValidationError("Category cannot be its own parent");
      }

      const parent = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parent) {
        throw new ValidationError("Parent category not found");
      }

      // Check if the new parent is a child of this category (would create a loop)
      const checkForLoop = async (parentId: string): Promise<boolean> => {
        const parent = await prisma.category.findUnique({
          where: { id: parentId },
        });

        if (!parent) return false;
        if (parent.id === id) return true;
        if (parent.parentId) return checkForLoop(parent.parentId);
        return false;
      };

      if (await checkForLoop(validatedData.parentId)) {
        throw new ValidationError("Cannot create circular category relationship");
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
      include: {
        children: true,
        parent: true,
      },
    });

    return Response.json({ category });
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
    isOwner(user);

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
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

    // Check if category has products
    if (category._count.products > 0) {
      throw new ValidationError(
        `Cannot delete category with ${category._count.products} products. Please move or delete products first.`
      );
    }

    // Check if category has children
    if (category.children.length > 0) {
      throw new ValidationError(
        `Cannot delete category with ${category.children.length} subcategories. Please delete subcategories first.`
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return Response.json({ message: "Category deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}
