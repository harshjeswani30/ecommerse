import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateTokens } from "@/lib/auth";
import { AuthenticationError, ValidationError, handleError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

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
    });
  } catch (error) {
    return handleError(error);
  }
}
