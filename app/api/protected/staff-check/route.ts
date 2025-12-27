import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { isStaff } from "@/lib/rbac";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  isStaff(req.user);

  const staffDetails = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      staffPermissions: true,
    },
  });

  return NextResponse.json({
    message: "Access granted: Staff only",
    staff: staffDetails,
  });
});
