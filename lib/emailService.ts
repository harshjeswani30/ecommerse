// Email service for payment notifications
// Note: This is a placeholder implementation
// In a production environment, you would integrate with an email service like SendGrid, Mailgun, etc.

import { prisma } from "./prisma";

// Mock email sending function
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  console.log("Sending email:", { to, subject });
  // In production, this would call an email service API
}

// Send payment success email
export async function sendPaymentSuccessEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      orderItems: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const itemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.priceAtPurchase.toFixed(2)}</td>
        <td>₹${(item.quantity * item.priceAtPurchase.toNumber()).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <html>
      <body>
        <h2>Payment Successful - Order #${order.orderNumber}</h2>
        <p>Dear ${order.user.name},</p>
        <p>Your payment for order #${order.orderNumber} has been successfully processed.</p>
        
        <h3>Order Details:</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
          ${itemsHtml}
          <tr>
            <td colspan="3" align="right"><strong>Subtotal:</strong></td>
            <td>₹${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" align="right"><strong>Tax:</strong></td>
            <td>₹${order.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" align="right"><strong>Discount:</strong></td>
            <td>-₹${order.discount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" align="right"><strong>Total:</strong></td>
            <td>₹${order.total.toFixed(2)}</td>
          </tr>
        </table>
        
        <p><a href="${process.env.NEXT_PUBLIC_API_URL}/orders/track/${order.orderNumber}">Track your order</a></p>
        
        <p>Thank you for shopping with RAJ FASHION!</p>
      </body>
    </html>
  `;

  await sendEmail(
    order.user.email,
    `Payment Successful - Order #${order.orderNumber}`,
    emailHtml
  );
}

// Send payment failed email
export async function sendPaymentFailedEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const emailHtml = `
    <html>
      <body>
        <h2>Payment Failed - Order #${order.orderNumber}</h2>
        <p>Dear ${order.user.name},</p>
        <p>We regret to inform you that your payment for order #${order.orderNumber} has failed.</p>
        
        <h3>Order Details:</h3>
        <p>Order Number: ${order.orderNumber}</p>
        <p>Amount: ₹${order.total.toFixed(2)}</p>
        
        <p>Please try again or contact our support team if you need assistance.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_API_URL}/payments/status/${order.id}">Retry Payment</a></p>
        
        <p>Thank you for shopping with RAJ FASHION!</p>
      </body>
    </html>
  `;

  await sendEmail(
    order.user.email,
    `Payment Failed - Order #${order.orderNumber}`,
    emailHtml
  );
}

// Send refund confirmation email
export async function sendRefundConfirmationEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const emailHtml = `
    <html>
      <body>
        <h2>Refund Processed - Order #${order.orderNumber}</h2>
        <p>Dear ${order.user.name},</p>
        <p>Your refund for order #${order.orderNumber} has been successfully processed.</p>
        
        <h3>Refund Details:</h3>
        <p>Order Number: ${order.orderNumber}</p>
        <p>Refund Amount: ₹${order.refundAmount?.toFixed(2) || "0.00"}</p>
        <p>Reason: ${order.refundReason || "Not specified"}</p>
        
        <p>The refund will be credited to your original payment method within 5-7 business days.</p>
        
        <p>Thank you for shopping with RAJ FASHION!</p>
      </body>
    </html>
  `;

  await sendEmail(
    order.user.email,
    `Refund Processed - Order #${order.orderNumber}`,
    emailHtml
  );
}
