import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { isCustomer } from "@/lib/rbac";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  isCustomer(req.user);

  const customerProfile = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
    },
  });

  return NextResponse.json({
    message: "Access granted: Customer only",
    customer: customerProfile,
  });
});
