"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../layout";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Select } from "@/components/UI/Select";
import { formatPrice, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

interface Stats {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  todayOrders: number;
  totalCustomers: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  user: { name: string };
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    todaySales: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // For demo purposes, using placeholder data
        // In production, these would be actual API calls
        setStats({
          totalSales: 125000,
          todaySales: 8500,
          totalOrders: 156,
          todayOrders: 12,
          totalCustomers: 89,
          lowStockProducts: 5,
        });
        
        setRecentOrders([
          { id: "1", orderNumber: "ORD-001", user: { name: "John Doe" }, total: 2500, status: "PENDING", createdAt: new Date().toISOString() },
          { id: "2", orderNumber: "ORD-002", user: { name: "Jane Smith" }, total: 1800, status: "SHIPPED", createdAt: new Date().toISOString() },
          { id: "3", orderNumber: "ORD-003", user: { name: "Bob Johnson" }, total: 3200, status: "DELIVERED", createdAt: new Date().toISOString() },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to RAJ FASHION Admin Panel</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new">
            <Button>Add Product</Button>
          </Link>
          <Link href="/admin/categories/new">
            <Button variant="outline">Add Category</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.todaySales)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-black hover:underline">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-black hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600">{order.user.name}</td>
                    <td className="py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                        order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link href="/admin/products?filter=low-stock" className="text-sm text-black hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {/* Placeholder for low stock products */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Winter Jacket</p>
                <p className="text-sm text-gray-500">Only 2 left in stock</p>
              </div>
              <Link href="/admin/products/1/edit">
                <Button variant="outline" size="sm">Restock</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Summer Dress</p>
                <p className="text-sm text-gray-500">Only 3 left in stock</p>
              </div>
              <Link href="/admin/products/2/edit">
                <Button variant="outline" size="sm">Restock</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Casual Shirt</p>
                <p className="text-sm text-gray-500">Only 4 left in stock</p>
              </div>
              <Link href="/admin/products/3/edit">
                <Button variant="outline" size="sm">Restock</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
