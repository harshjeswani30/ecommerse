import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignatureHelper } from "@/lib/paymentHelpers";
import { processWebhookPaymentAuthorized, processWebhookPaymentFailed } from "@/lib/paymentHelpers";
import { handleError } from "@/lib/errors";
import { PaymentStatus } from "@prisma/client";

export const POST = async (req: Request) => {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const payload = await req.text();

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignatureHelper(payload, signature);

    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(payload);

    console.log("Received Razorpay webhook event:", event.event);

    // Handle different webhook events
    switch (event.event) {
      case "payment.authorized":
        await handlePaymentAuthorized(event.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case "refund.created":
        await handleRefundCreated(event.payload.refund.entity);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    // Always return 200 OK to acknowledge webhook receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
};

async function handlePaymentAuthorized(payment: any) {
  try {
    const { order_id, id: payment_id } = payment;

    console.log("Processing payment authorized event:", { order_id, payment_id });

    await processWebhookPaymentAuthorized(order_id, payment_id);

    // In a production environment, you would send email/SMS notifications here
    console.log("Payment authorized processed successfully");
  } catch (error) {
    console.error("Error processing payment authorized:", error);
    throw error;
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    const { order_id } = payment;

    console.log("Processing payment failed event:", { order_id });

    await processWebhookPaymentFailed(order_id);

    // In a production environment, you would send failure notifications here
    console.log("Payment failed processed successfully");
  } catch (error) {
    console.error("Error processing payment failed:", error);
    throw error;
  }
}

async function handleRefundCreated(refund: any) {
  try {
    const { payment_id, id: refund_id, amount } = refund;

    console.log("Processing refund created event:", { payment_id, refund_id, amount });

    // Find order by razorpay payment ID
    const order = await prisma.order.findFirst({
      where: { razorpayPaymentId: payment_id },
    });

    if (order) {
      // Update order with refund information
      await prisma.order.update({
        where: { id: order.id },
        data: {
          refundStatus: "PROCESSED",
          refundAmount: amount / 100, // Convert back to rupees
          refundId: refund_id,
        },
      } as any);

      console.log("Refund processed successfully for order:", order.id);
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
}
