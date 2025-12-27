"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/UI/Button";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const initPayment = async () => {
      const orderId = localStorage.getItem("pendingOrderId");
      
      if (!orderId) {
        router.push("/checkout");
        return;
      }

      try {
        // Get order details
        const orderData = await api.get<Order>(`/orders/${orderId}`);
        setOrder(orderData);

        // Get payment details
        const paymentData = await api.post<{
          razorpayOrderId: string;
          amount: number;
          keyId: string;
          orderNumber: string;
        }>("/payments/initiate", { orderId });

        // Load Razorpay script
        if (!window.Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => openRazorpay(paymentData, orderData);
          script.onerror = () => {
            setError("Failed to load payment gateway");
            setLoading(false);
          };
          document.body.appendChild(script);
        } else {
          openRazorpay(paymentData, orderData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment");
        setLoading(false);
      }
    };

    initPayment();
  }, [router]);

  const openRazorpay = (paymentData: any, orderData: Order) => {
    const razorpay = new window.Razorpay({
      key: paymentData.keyId,
      order_id: paymentData.razorpayOrderId,
      amount: paymentData.amount * 100, // Convert to paise
      currency: "INR",
      name: "RAJ FASHION",
      description: `Order #${paymentData.orderNumber}`,
      handler: async (response: any) => {
        try {
          // Verify payment
          await api.post("/payments/verify", {
            orderId: orderData.id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });

          // Clear pending order
          localStorage.removeItem("pendingOrderId");
          
          // Redirect to success page
          router.push(`/orders/${orderData.id}?payment=success`);
        } catch (err) {
          setError("Payment verification failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
      prefill: {
        name: orderData.user?.name || "",
        email: orderData.user?.email || "",
        contact: orderData.shippingAddress?.phone || "",
      },
      notes: {
        order_id: orderData.id,
      },
      theme: {
        color: "#000000",
      },
    });

    razorpay.open();
    setLoading(false);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Preparing Payment...</h2>
            <p className="text-gray-600 mt-2">Please wait while we set up the payment gateway</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button onClick={handleRetry}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}
