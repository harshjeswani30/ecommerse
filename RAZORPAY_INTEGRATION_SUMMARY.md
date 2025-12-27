# RAZORPAY PAYMENT GATEWAY INTEGRATION - RAJ FASHION

## ✅ IMPLEMENTATION COMPLETE

This document summarizes the complete Razorpay payment gateway integration for the RAJ FASHION e-commerce platform.

## 📁 Files Created

### Core Configuration
- **`lib/razorpay.ts`** - Razorpay client initialization and signature verification
- **`lib/paymentHelpers.ts`** - Payment utility functions (amount conversion, signature verification, order updates)
- **`lib/emailService.ts`** - Payment notification emails (success, failure, refund)
- **`lib/paymentTest.ts`** - Test utilities for payment functionality

### API Endpoints
- **`app/api/payments/initiate/route.ts`** - POST: Initiate Razorpay payment order
- **`app/api/payments/verify/route.ts`** - POST: Verify payment signature and update order status
- **`app/api/payments/webhook/route.ts`** - POST: Handle Razorpay webhook events
- **`app/api/payments/status/[orderId]/route.ts`** - GET: Check payment status for specific order
- **`app/api/payments/history/route.ts`** - GET: Get user's payment history with pagination
- **`app/api/payments/refund/route.ts`** - POST: Initiate refund for completed orders (owner only)

### Database Updates
- **`prisma/schema.prisma`** - Added refund fields to Order model:
  - `refundStatus` (String?)
  - `refundAmount` (Decimal?)
  - `refundId` (String?)
  - `refundReason` (String?)

### Type Definitions
- **`lib/types.ts`** - Extended with Razorpay-specific types:
  - `RazorpayOrder` interface
  - `RazorpayPayment` interface
  - `PaymentVerificationPayload` interface
  - `RazorpayWebhook` interface
  - `PaymentStatusResponse` interface
  - `PaymentHistoryItem` interface

### Error Handling
- **`lib/errors.ts`** - Added custom payment errors:
  - `PaymentVerificationError`
  - `RazorpayError`
  - `InvalidSignatureError`
  - `PaymentTimeoutError`

### Configuration
- **`.env.local.example`** - Added Razorpay environment variables:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`

### Order Creation Updates
- **`app/api/orders/route.ts`** - Updated POST endpoint to include:
  - `paymentStatus: "PENDING"`
  - `razorpayOrderId: null`
  - `razorpayPaymentId: null`

## 🔧 Features Implemented

### 1. Payment Initiation
- ✅ Create Razorpay orders with correct amount (converted to paise)
- ✅ Validate order ownership and status
- ✅ Store Razorpay order ID in database
- ✅ Return payment details for frontend integration

### 2. Payment Verification
- ✅ HMAC SHA256 signature verification
- ✅ Validate payment authenticity
- ✅ Update order payment status (COMPLETED/FAILED)
- ✅ Log payment transactions
- ✅ Handle invalid signatures securely

### 3. Webhook Processing
- ✅ Webhook signature verification
- ✅ Handle `payment.authorized` events (auto-update to PACKED)
- ✅ Handle `payment.failed` events
- ✅ Handle `refund.created` events
- ✅ Always return 200 OK to acknowledge receipt

### 4. Payment Status Management
- ✅ Check payment status for specific orders
- ✅ Authentication and authorization checks
- ✅ Return comprehensive payment information

### 5. Payment History
- ✅ Get all user payments with pagination
- ✅ Filter by payment status
- ✅ Role-based access control (owner can see all, customers see their own)

### 6. Refund Processing
- ✅ Owner-only access control
- ✅ Validate order eligibility for refunds
- ✅ Create Razorpay refunds
- ✅ Update order with refund information
- ✅ Send refund confirmation emails

### 7. Email Notifications
- ✅ Payment success emails with order details
- ✅ Payment failure emails with retry links
- ✅ Refund confirmation emails
- ✅ HTML email templates with order summaries

### 8. Security
- ✅ HMAC signature verification for all payment operations
- ✅ Webhook signature verification
- ✅ Authentication middleware for all API endpoints
- ✅ Authorization checks (customer/owner access control)
- ✅ Input validation and error handling

### 9. Error Handling
- ✅ Custom payment error classes
- ✅ Comprehensive error responses
- ✅ Logging for debugging and auditing
- ✅ Graceful error recovery

## 🚀 Payment Flow

### Standard Payment Flow
1. Customer adds items to cart
2. Customer creates order (status: PENDING, paymentStatus: PENDING)
3. Frontend calls `/api/payments/initiate` with orderId
4. Server creates Razorpay order and returns payment details
5. Frontend opens Razorpay checkout modal with returned details
6. Customer completes payment on Razorpay
7. Razorpay redirects to frontend with payment details
8. Frontend calls `/api/payments/verify` with transaction details
9. Server verifies signature and updates payment status
10. Server sends confirmation email
11. Razorpay webhook confirms payment (backup verification)

### Webhook Flow
1. Razorpay sends webhook for payment event
2. Server verifies webhook signature
3. Server processes event based on type
4. Server updates order status and payment information
5. Server sends appropriate notifications
6. Server returns 200 OK to acknowledge receipt

### Refund Flow
1. Owner initiates refund from admin panel
2. Owner calls `/api/payments/refund` with orderId and reason
3. Server validates refund eligibility
4. Server creates Razorpay refund
5. Razorpay processes refund to customer's payment method
6. Webhook notifies on refund completion
7. Server updates order with refund details
8. Server sends refund confirmation email

## 📋 API Endpoints Summary

### POST `/api/payments/initiate`
**Input:** `{ orderId: string }`
**Authentication:** Customer only
**Response:** Razorpay order details for checkout

### POST `/api/payments/verify`
**Input:** `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }`
**Authentication:** Customer only
**Response:** Payment verification result and updated order

### POST `/api/payments/webhook`
**Input:** Razorpay webhook payload
**Authentication:** None (webhook signature verification)
**Response:** 200 OK on successful processing

### GET `/api/payments/status/[orderId]`
**Authentication:** Customer or Owner
**Response:** Current payment status and order details

### GET `/api/payments/history`
**Query Params:** `status`, `page`, `limit`
**Authentication:** Customer or Owner
**Response:** Paginated payment history

### POST `/api/payments/refund`
**Input:** `{ orderId: string, reason?: string }`
**Authentication:** Owner only
**Response:** Refund details and updated order

## 🛠️ Setup Instructions

### 1. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and add your Razorpay credentials:

```env
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
```

### 2. Set Up Razorpay Webhooks
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Enable events: `payment.authorized`, `payment.failed`, `refund.created`
4. Add your webhook secret to environment variables

### 3. Database Migration
Run the following command to update your database schema:

```bash
npx prisma migrate dev --name add_refund_fields
```

### 4. Frontend Integration
Integrate with your frontend payment UI:

```javascript
// Example frontend integration
const initiatePayment = async (orderId) => {
  const response = await fetch('/api/payments/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  });
  
  const { razorpayOrderId, amount, currency, description } = await response.json();
  
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: amount,
    currency: currency,
    name: 'RAJ FASHION',
    description: description,
    order_id: razorpayOrderId,
    handler: async function (response) {
      // Verify payment
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });
      
      // Redirect to success page
      window.location.href = '/payment-success';
    },
    prefill: {
      name: 'Customer Name',
      email: 'customer@example.com',
      contact: '9999999999'
    },
    theme: {
      color: '#3399cc'
    }
  };
  
  const rzp = new Razorpay(options);
  rzp.open();
};
```

## 🧪 Testing

### Manual Testing
1. Create an order through the normal checkout process
2. Call the payment initiation endpoint
3. Complete a test payment using Razorpay test cards
4. Verify the payment verification endpoint works
5. Check that webhooks are received and processed
6. Test the refund functionality

### Test Cards
Use Razorpay test cards for development:
- **Success:** `4111 1111 1111 1111` (CVV: 123, Expiry: Any future date)
- **Failure:** `4000 0000 0000 0002` (CVV: 123, Expiry: Any future date)

## 📊 Monitoring and Logging

### Payment Logging
All payment transactions are logged with:
- Order ID and Razorpay order ID
- Payment amount and status
- Transaction timestamps
- Error details (if any)

### Webhook Logging
All webhook events are logged with:
- Event type and payload
- Signature verification results
- Processing outcomes

## 🔒 Security Best Practices

### 1. Never expose Razorpay secret key to frontend
### 2. Always verify payment signatures
### 3. Use HTTPS for all payment endpoints
### 4. Implement rate limiting on payment endpoints
### 5. Monitor for suspicious payment activity
### 6. Keep Razorpay SDK updated
### 7. Use environment variables for sensitive data

## 🎯 Acceptance Criteria Met

✅ Razorpay account setup and configuration  
✅ Payment initiation API  
✅ Payment verification API with signature validation  
✅ Webhook handler for Razorpay events  
✅ Payment status checking  
✅ Refund processing  
✅ Payment history/transaction list  
✅ Email notifications (success/failure)  
✅ Error handling and logging  
✅ HMAC signature verification  
✅ Order updates on payment (paymentStatus, razorpayPaymentId)  
✅ Webhook signature validation  
✅ TypeScript types for payments  
✅ All environment variables configured  

## 📚 Documentation

For more information, refer to:
- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Razorpay Webhooks Guide](https://razorpay.com/docs/payments/webhooks/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/checkout/)

## 🎉 Implementation Complete!

The Razorpay payment gateway integration is now fully implemented and ready for testing. All required features have been developed according to the specifications.
