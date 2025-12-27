// Payment test utilities for Razorpay integration
// These are helper functions for testing payment functionality

import { verifyPaymentSignature, verifyWebhookSignatureHelper } from "./paymentHelpers";
import { razorpay } from "./razorpay";

// Test Razorpay credentials
export function testRazorpayCredentials(): boolean {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials are not configured");
      return false;
    }
    
    console.log("Razorpay credentials are configured correctly");
    return true;
  } catch (error) {
    console.error("Error testing Razorpay credentials:", error);
    return false;
  }
}

// Test signature verification
export function testSignatureVerification(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    console.log("Signature verification test:", isValid ? "PASSED" : "FAILED");
    return isValid;
  } catch (error) {
    console.error("Error testing signature verification:", error);
    return false;
  }
}

// Generate test webhook payload
export function generateTestWebhookPayload(
  event: string,
  orderId: string,
  paymentId: string
): string {
  return JSON.stringify({
    event,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: 10000, // 100.00 INR
          currency: "INR",
          status: "captured",
          method: "card",
          email: "test@example.com",
          contact: "+919876543210",
        },
      },
    },
    created_at: Math.floor(Date.now() / 1000),
  } as any);
}

// Test webhook signature verification
export function testWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const isValid = verifyWebhookSignatureHelper(payload, signature);
    console.log("Webhook signature verification test:", isValid ? "PASSED" : "FAILED");
    return isValid;
  } catch (error) {
    console.error("Error testing webhook signature:", error);
    return false;
  }
}

// Create test Razorpay order
export async function createTestRazorpayOrder(
  amount: number,
  receipt: string,
  description: string
) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt,
    });
    
    console.log("Test Razorpay order created:", (order as any).id);
    return order as any;
  } catch (error) {
    console.error("Error creating test Razorpay order:", error);
    throw error;
  }
}

// Mock payment verification for testing
export function mockPaymentVerification(
  orderId: string,
  paymentId: string
): string {
  // This is a mock function for testing - in production, use real signature verification
  const mockSecret = "test_secret";
  const signature = require("crypto")
    .createHmac("sha256", mockSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  
  return signature;
}
