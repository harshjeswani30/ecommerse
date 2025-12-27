import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { handleError } from "@/lib/errors";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { UserRole } from "@prisma/client";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    // Only OWNER can initiate refunds
    if (req.user.role !== UserRole.OWNER) {
      throw new ValidationError("Only OWNER can initiate refunds");
    }

    const { orderId, reason } = await req.json();

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Validate order for refund
    if (!["DELIVERED", "CANCELLED"].includes(order.status)) {
      throw new ValidationError("Order must be DELIVERED or CANCELLED for refund");
    }

    if (order.paymentStatus !== "COMPLETED") {
      throw new ValidationError("Order payment must be COMPLETED for refund");
    }

    if (!order.razorpayPaymentId) {
      throw new ValidationError("Order does not have a Razorpay payment ID");
    }

    // Create Razorpay refund
    const refund = await razorpay.payments.refund(order.razorpayPaymentId!, {
      amount: Math.round(order.total.toNumber() * 100), // Convert to paise
      speed: "normal",
      notes: {
        order_id: order.id,
        reason: reason || "Customer requested refund",
      },
    } as any);

    // Update order with refund information
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundStatus: "PROCESSED",
        refundAmount: order.total,
        refundId: refund.id,
        refundReason: reason,
      },
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        createdAt: refund.created_at,
      },
      order: updatedOrder,
    });
  } catch (error) {
    return handleError(error);
  }
});
