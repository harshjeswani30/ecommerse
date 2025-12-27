import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { NotFoundError, ValidationError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: { orderId: string } }) => {
  try {
    const orderId = params.orderId;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Verify order belongs to user (unless user is OWNER)
    if (order.userId !== req.user.userId && req.user.role !== "OWNER") {
      throw new ValidationError("Order does not belong to the current user");
    }

    // Return current payment status and order details
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      amount: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    return handleError(error);
  }
});
