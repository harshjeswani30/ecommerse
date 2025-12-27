import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { calculatePaymentAmount, validateOrderForPayment } from "@/lib/paymentHelpers";
import { formatPaymentResponse } from "@/lib/paymentHelpers";
import { handleError } from "@/lib/errors";
import { PaymentStatus } from "@prisma/client";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { orderId } = await req.json();

    // Validate order for payment
    await validateOrderForPayment(orderId, req.user.userId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order already has a Razorpay order ID
    if (order.razorpayOrderId) {
      return NextResponse.json(
        { error: "Payment already initiated for this order" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: calculatePaymentAmount(order.total.toNumber()),
      currency: "INR",
      receipt: order.orderNumber,
    });

    // Update order with Razorpay order ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // Format and return payment response
    const response = formatPaymentResponse(
      razorpayOrder.id,
      Number(razorpayOrder.amount),
      razorpayOrder.currency,
      `Order #${order.orderNumber}`
    );

    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
});
