import { prisma } from "./prisma";
import { verifyRazorpaySignature, verifyWebhookSignature } from "./razorpay";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "./errors";

// Convert amount to paise (Razorpay uses paise)
export function calculatePaymentAmount(amount: number): number {
  return Math.round(amount * 100);
}

// Verify Razorpay signature
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  return verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
}

// Verify webhook signature
export function verifyWebhookSignatureHelper(
  payload: string,
  signature: string
): boolean {
  return verifyWebhookSignature(payload, signature);
}

// Format payment response
export function formatPaymentResponse(
  razorpayOrderId: string,
  amount: number,
  currency: string,
  description: string
) {
  return {
    razorpayOrderId,
    amount,
    currency,
    description,
  };
}

// Handle payment error
export function handlePaymentError(error: unknown): never {
  console.error("Payment error:", error);
  if (error instanceof Error) {
    throw new ValidationError(error.message);
  }
  throw new ValidationError("Payment processing failed");
}

// Update order payment status
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  razorpayPaymentId?: string | null
) {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus,
      razorpayPaymentId,
    },
  });
}

// Get order by razorpay order ID
export async function getOrderByRazorpayOrderId(razorpayOrderId: string) {
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
  });

  if (!order) {
    throw new NotFoundError("Order not found for the given Razorpay order ID");
  }

  return order;
}

// Validate order for payment
export async function validateOrderForPayment(
  orderId: string,
  userId: string
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.userId !== userId) {
    throw new ValidationError("Order does not belong to the current user");
  }

  if (order.paymentStatus !== PaymentStatus.PENDING) {
    throw new ValidationError("Order payment status is not PENDING");
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new ValidationError("Order status is not PENDING");
  }
}

// Log payment transaction
export async function logPaymentTransaction(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string | null,
  amount: number,
  status: string,
  details?: any
) {
  console.log("Payment transaction logged:", {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    amount,
    status,
    details,
  });

  // In a production environment, you would store this in a database
  // For now, we'll just log to console
}

// Process successful payment
export async function processSuccessfulPayment(
  orderId: string,
  razorpayPaymentId: string
) {
  const order = await updateOrderPaymentStatus(
    orderId,
    PaymentStatus.COMPLETED,
    razorpayPaymentId
  );

  await logPaymentTransaction(
    orderId,
    order.razorpayOrderId!,
    razorpayPaymentId,
    order.total.toNumber(),
    "COMPLETED"
  );

  return order;
}

// Process failed payment
export async function processFailedPayment(orderId: string) {
  const order = await updateOrderPaymentStatus(
    orderId,
    PaymentStatus.FAILED,
    null
  );

  await logPaymentTransaction(
    orderId,
    order.razorpayOrderId!,
    null,
    order.total.toNumber(),
    "FAILED"
  );

  return order;
}

// Process webhook payment authorized event
export async function processWebhookPaymentAuthorized(
  razorpayOrderId: string,
  razorpayPaymentId: string
) {
  const order = await getOrderByRazorpayOrderId(razorpayOrderId);

  // Update payment status to COMPLETED
  await updateOrderPaymentStatus(order.id, PaymentStatus.COMPLETED, razorpayPaymentId);

  // Auto-update order status to PACKED
  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.PACKED },
  });

  await logPaymentTransaction(
    order.id,
    razorpayOrderId,
    razorpayPaymentId,
    order.total.toNumber(),
    "WEBHOOK_AUTHORIZED"
  );

  return order;
}

// Process webhook payment failed event
export async function processWebhookPaymentFailed(razorpayOrderId: string) {
  const order = await getOrderByRazorpayOrderId(razorpayOrderId);

  // Update payment status to FAILED
  await updateOrderPaymentStatus(order.id, PaymentStatus.FAILED, null);

  await logPaymentTransaction(
    order.id,
    razorpayOrderId,
    null,
    order.total.toNumber(),
    "WEBHOOK_FAILED"
  );

  return order;
}
