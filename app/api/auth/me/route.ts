import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { AuthenticationError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  return NextResponse.json(user);
});
