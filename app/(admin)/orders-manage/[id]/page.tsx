"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../../layout";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/Select";
import { OrderItems, OrderTimeline } from "@/components/Orders/OrderTimeline";
import { PriceBreakdown } from "@/components/Cart/PriceBreakdown";
import { formatPrice, formatDate, getStatusColor, getPaymentStatusColor } from "@/lib/utils";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get<Order>(`/orders/${orderId}`);
        setOrder(data);
        setTrackingId(data.trackingId || "");
      } catch {
        router.push("/admin/orders");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const updated = await api.put<Order>(`/orders/${orderId}/status`, { status: newStatus });
      setOrder(updated);
    } catch {
      alert("Failed to update status");
    }
  };

  const handleTrackingUpdate = async () => {
    setSaving(true);
    try {
      const updated = await api.put<Order>(`/orders/${orderId}`, { trackingId });
      setOrder(updated);
    } catch {
      alert("Failed to update tracking ID");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-gray-500 hover:text-black">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Select
                value={order.status}
                onChange={handleStatusUpdate}
                options={statusOptions}
              />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                Payment: {order.paymentStatus}
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
              <div className="flex gap-2">
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking ID"
                />
                <Button onClick={handleTrackingUpdate} loading={saving}>Update</Button>
              </div>
            </div>

            <OrderTimeline statusHistory={order.statusHistory} currentStatus={order.status} />
          </Card>

          {/* Customer Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{order.user?.name || "Guest"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.user?.email || "-"}</p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h2>
            <OrderItems items={order.items} />
          </Card>

          {/* Shipping Address */}
          <Card>
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
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <PriceBreakdown
                subtotal={order.subtotal}
                tax={order.tax}
                discount={order.discount}
                total={order.total}
                couponCode={order.couponCode}
              />
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{order.paymentMethod || "Razorpay"}</span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-medium text-xs">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
