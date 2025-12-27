import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTokens } from "@/lib/auth";
import { ValidationError, handleError } from "@/lib/errors";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name) {
      throw new ValidationError("Email, password, and name are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("Email already in use");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: UserRole.CUSTOMER,
      },
    });

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      ...tokens,
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
