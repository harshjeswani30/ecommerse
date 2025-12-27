"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { OrderCard } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Select } from "@/components/UI/Select";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/lib/types";

const statusFilters = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { orders, loading, fetchOrders } = useOrders();
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  useEffect(() => {
    if (statusFilter) {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter));
    } else {
      setFilteredOrders(orders);
    }
  }, [orders, statusFilter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
            <Link href="/login">
              <Button>Login</Button>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your orders</p>
            </div>

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusFilters}
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={{
                    id: order.id,
                    orderNumber: order.orderNumber,
                    total: order.total,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    createdAt: order.createdAt,
                    itemCount: order.items.length,
                  }}
                  onViewDetails={() => window.location.href = `/orders/${order.id}`}
                  onTrackOrder={() => window.location.href = `/orders/track/${order.orderNumber}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="mt-6 text-xl font-bold text-gray-900">No orders yet</h2>
              <p className="mt-2 text-gray-600">Start shopping to see your orders here.</p>
              <Link href="/shop">
                <Button className="mt-6">Start Shopping</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
