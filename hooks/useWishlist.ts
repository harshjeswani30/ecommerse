"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { WishlistItem, Product, PaginatedResponse } from "@/lib/types";

interface UseWishlistReturn {
  wishlist: WishlistItem[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    try {
      const data = await api.get<WishlistItem[]>("/wishlist");
      setWishlist(data);
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlist = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const newItem = await api.post<WishlistItem>("/wishlist", { productId });
      setWishlist((prev) => [...prev, newItem]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    } finally {
      setLoading(false);
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((item) => item.productId === productId),
    [wishlist]
  );

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist,
  };
}
