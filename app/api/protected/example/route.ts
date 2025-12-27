import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { checkStaffPermission } from "@/lib/rbac";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    // Check for a specific staff permission
    // For example, adding a product
    await checkStaffPermission(req.user.userId, "canAddProducts");

    // Perform action
    return NextResponse.json({
      message: "Action performed successfully by staff with proper permission",
    });
  } catch (error) {
    // handleError is already called by withAuth, but we can catch and re-throw if needed
    throw error;
  }
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  // General authenticated access
  return NextResponse.json({
    message: "This is a protected route",
    user: req.user,
  });
});
