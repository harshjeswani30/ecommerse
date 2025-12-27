import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { isOwner } from "@/lib/rbac";
import { ValidationError } from "@/lib/errors";

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: { staffId: string } }) => {
  isOwner(req.user);
  
  const staffId = params.staffId;
  const { 
    canAddProducts, 
    canEditProducts, 
    canDeleteProducts, 
    canManageCategories,
    assignedCategories 
  } = await req.json();

  if (!staffId) {
    throw new ValidationError("Staff ID is required");
  }

  const permissions = await prisma.staffPermission.upsert({
    where: { staffId },
    update: {
      ...(canAddProducts !== undefined && { canAddProducts }),
      ...(canEditProducts !== undefined && { canEditProducts }),
      ...(canDeleteProducts !== undefined && { canDeleteProducts }),
      ...(canManageCategories !== undefined && { canManageCategories }),
      ...(assignedCategories !== undefined && { assignedCategories }),
    },
    create: {
      staffId,
      canAddProducts: canAddProducts || false,
      canEditProducts: canEditProducts || false,
      canDeleteProducts: canDeleteProducts || false,
      canManageCategories: canManageCategories || false,
      assignedCategories: assignedCategories || [],
    },
  });

  return NextResponse.json(permissions);
});
