import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateTokens } from "@/lib/auth";
import { AuthenticationError, handleError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      throw new AuthenticationError("Refresh token is required");
    }

    const payload = verifyToken(refreshToken);

    if (!payload) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json(tokens);
  } catch (error) {
    return handleError(error);
  }
}
