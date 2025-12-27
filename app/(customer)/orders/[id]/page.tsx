"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { OrderTimeline, OrderItems } from "@/components/Orders/OrderTimeline";
import { PriceBreakdown } from "@/components/Cart/PriceBreakdown";
import { Button } from "@/components/UI/Button";
import { Select } from "@/components/UI/Select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatPrice, getStatusColor, getPaymentStatusColor } from "@/lib/utils";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get<Order>(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        error("Order not found");
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) fetchOrder();
  }, [orderId, error]);

  const handleStatusUpdate = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      const updated = await api.put<Order>(`/orders/${orderId}/status`, { status: newStatus });
      setOrder(updated);
      success("Order status updated");
    } catch (err: any) {
      error(err.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      await handleStatusUpdate("CANCELLED");
      success("Order cancelled successfully");
    } catch {
      error("Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
            <Link href="/orders" className="mt-4 inline-block text-black underline">
              Back to Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <nav className="text-sm text-gray-500">
              <Link href="/" className="hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/orders" className="hover:text-black">Orders</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">#{order.orderNumber}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>

            <div className="flex gap-3">
              {order.status === "PENDING" && (
                <Button variant="danger" onClick={handleCancelOrder}>
                  Cancel Order
                </Button>
              )}
              {["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status) && (
                <Button variant="outline" onClick={() => window.location.href = `/orders/track/${order.orderNumber}`}>
                  Track Order
                </Button>
              )}
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Invoice
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Status & Payment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-500 text-sm capitalize">{order.paymentStatus.toLowerCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900">{order.paymentMethod || "Razorpay"}</p>
                  </div>
                  {order.trackingId && (
                    <div>
                      <p className="text-sm text-gray-500">Tracking ID</p>
                      <p className="font-medium text-gray-900">{order.trackingId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
                <OrderTimeline statusHistory={order.statusHistory} currentStatus={order.status} />
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h2>
                <OrderItems items={order.items} />
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <PriceBreakdown
                  subtotal={order.subtotal}
                  tax={order.tax}
                  discount={order.discount}
                  total={order.total}
                  couponCode={order.couponCode}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
