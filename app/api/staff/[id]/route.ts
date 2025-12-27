import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { isOwner } from "@/lib/rbac";
import { ValidationError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  isOwner(req.user);
  
  const id = params.id;

  if (!id) {
    throw new ValidationError("Staff ID is required");
  }

  const staff = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      staffPermissions: true,
    },
  });

  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  return NextResponse.json(staff);
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  isOwner(req.user);
  
  const id = params.id;

  if (!id) {
    throw new ValidationError("Staff ID is required");
  }

  if (id === req.user.userId) {
    throw new ValidationError("You cannot delete yourself");
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Staff removed successfully" });
});

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  isOwner(req.user);
  
  const id = params.id;
  const { name, phone, role } = await req.json();

  if (!id) {
    throw new ValidationError("Staff ID is required");
  }

  const updatedStaff = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(role && { role }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      staffPermissions: true,
    },
  });

  return NextResponse.json(updatedStaff);
});
