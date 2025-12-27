import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getOrderTimeline } from "@/lib/orderHelpers";
import { UserRole } from "@prisma/client";
import { NotFoundError, handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const orderId = context.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.userId !== req.user.userId && req.user.role !== UserRole.OWNER) {
      throw new Error("Unauthorized to view this order timeline");
    }

    const timeline = getOrderTimeline(order);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      timeline,
    });
  } catch (error) {
    return handleError(error);
  }
});
