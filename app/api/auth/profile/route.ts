import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { ValidationError } from "@/lib/errors";

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  const { name, phone } = await req.json();

  if (!name && !phone) {
    throw new ValidationError("Nothing to update");
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updatedUser);
});
