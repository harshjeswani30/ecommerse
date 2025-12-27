import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errors";
import { validateCategory } from "@/lib/validation";
import { authMiddleware } from "@/lib/middleware";
import { isOwner } from "@/lib/rbac";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return Response.json({ categories });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    isOwner(user);

    const body = await req.json();
    const validatedData = validateCategory(body);

    // Check if slug already exists
    const existingSlug = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      throw new ValidationError("Category with this slug already exists");
    }

    // Check if name already exists
    const existingName = await prisma.category.findUnique({
      where: { name: validatedData.name },
    });

    if (existingName) {
      throw new ValidationError("Category with this name already exists");
    }

    // If parentId is provided, check if parent exists
    if (validatedData.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parent) {
        throw new ValidationError("Parent category not found");
      }
    }

    const category = await prisma.category.create({
      data: validatedData,
      include: {
        children: true,
        parent: true,
      },
    });

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
