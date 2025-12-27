"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Cart, CartItem, Product } from "@/lib/types";

interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addToCart: (product: Product, size: string, color: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const cartData = await api.get<Cart>("/cart");
      setCart(cartData);
      setItemCount(cartData.itemCount);
    } catch {
      setCart(null);
      setItemCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (product: Product, size: string, color: string, quantity: number) => {
      setLoading(true);
      try {
        const response = await api.post<Cart>("/cart/items", {
          productId: product.id,
          size,
          color,
          quantity,
        });
        setCart(response);
        setItemCount(response.itemCount);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeFromCart = useCallback(async (itemId: string) => {
    setLoading(true);
    try {
      const response = await api.delete<Cart>(`/cart/items/${itemId}`);
      setCart(response);
      setItemCount(response.itemCount);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      const response = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
      setCart(response);
      setItemCount(response.itemCount);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart/clear");
      setCart(null);
      setItemCount(0);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    const response = await api.post<Cart>("/coupons/apply", { code });
    setCart(response);
    setItemCount(response.itemCount);
  }, []);

  const removeCoupon = useCallback(async () => {
    const response = await api.post<Cart>("/coupons/remove", {});
    setCart(response);
    setItemCount(response.itemCount);
  }, []);

  return {
    cart,
    loading,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart,
  };
}
