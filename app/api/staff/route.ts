import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { isOwner } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { UserRole } from "@prisma/client";

// Get all staff
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  isOwner(req.user);

  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.STAFF, UserRole.OWNER],
      },
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

  return NextResponse.json(staff);
});

// Create new staff
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  isOwner(req.user);

  const { email, password, name, phone, role } = await req.json();

  if (!email || !password || !name) {
    throw new ValidationError("Email, password, and name are required");
  }

  if (role && !["STAFF", "OWNER"].includes(role)) {
    throw new ValidationError("Invalid role for staff management");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ValidationError("Email already in use");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      role: (role as UserRole) || UserRole.STAFF,
      staffPermissions: {
        create: {}, // Create default empty permissions
      },
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

  return NextResponse.json(newUser, { status: 201 });
});
