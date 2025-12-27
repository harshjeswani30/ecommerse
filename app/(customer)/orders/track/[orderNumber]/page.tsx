"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { OrderTimeline } from "@/components/Orders/OrderTimeline";
import { Button } from "@/components/UI/Button";
import { formatDate, formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

export default function TrackOrderPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(orderNumber || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    }
  }, [orderNumber]);

  const fetchOrder = async (number: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Order>(`/orders/track/${number}`);
      setOrder(data);
    } catch {
      setError("Order not found. Please check the order number.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchOrder(searchQuery.trim());
    }
  };

  if (orderNumber) {
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

    if (error || !order) {
      return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-16">
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
              <p className="text-gray-600 mb-6">{error || "We couldn't find an order with this number."}</p>
              <Button onClick={() => router.push("/orders/track")}>
                Try Again
              </Button>
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
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">{order.status.replace(/_/g, " ")}</p>
                </div>
              </div>

              {/* Estimated Delivery */}
              {["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status) && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-medium">
                    Estimated Delivery: 3-5 business days
                  </p>
                </div>
              )}

              {/* Timeline */}
              <OrderTimeline statusHistory={order.statusHistory} currentStatus={order.status} />
            </div>

            {/* Order Items Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="font-semibold text-gray-900 mb-4">Items in your order</h2>
              <div className="divide-y divide-gray-100">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-4 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {item.product.images[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} • {item.size} • {item.color}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(item.priceAtPurchase * item.quantity)}</p>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-sm text-gray-500 py-3">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => window.print()}>
                Print Tracking Info
              </Button>
              <Link href={`/orders/${order.id}`}>
                <Button>View Full Order Details</Button>
              </Link>
            </div>
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
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
            <p className="text-gray-600 mt-2">Enter your order number to track your shipment</p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter order number (e.g., ORD-123456)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Button type="submit" loading={loading}>
                Track
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need help?{" "}
              <Link href="/contact" className="text-black underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
