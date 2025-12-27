import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/paymentHelpers";
import { processSuccessfulPayment, processFailedPayment } from "@/lib/paymentHelpers";
import { handleError } from "@/lib/errors";
import { getOrderByRazorpayOrderId } from "@/lib/paymentHelpers";
import { PaymentStatus } from "@prisma/client";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      // Invalid signature - update payment status to FAILED
      const order = await getOrderByRazorpayOrderId(razorpayOrderId);
      await processFailedPayment(order.id);

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Valid signature - process successful payment
    const order = await getOrderByRazorpayOrderId(razorpayOrderId);
    const updatedOrder = await processSuccessfulPayment(order.id, razorpayPaymentId);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    return handleError(error);
  }
});
