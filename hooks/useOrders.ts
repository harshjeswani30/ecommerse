"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Order, PaginatedResponse } from "@/lib/types";

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  trackOrder: (orderNumber: string) => Promise<Order | null>;
  getPaymentStatus: (orderId: string) => Promise<{ status: string } | null>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const data = await api.get<PaginatedResponse<Order>>(`/orders?page=${page}&limit=${limit}`);
      setOrders(data.data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (id: string): Promise<Order | null> => {
    try {
      const data = await api.get<Order>(`/orders/${id}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  const trackOrder = useCallback(async (orderNumber: string): Promise<Order | null> => {
    try {
      const data = await api.get<Order>(`/orders/track/${orderNumber}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  const getPaymentStatus = useCallback(async (orderId: string) => {
    try {
      const data = await api.get<{ status: string }>(`/payments/status/${orderId}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    fetchOrders,
    fetchOrderById,
    trackOrder,
    getPaymentStatus,
  };
}
