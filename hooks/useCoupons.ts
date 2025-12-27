"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Coupon } from "@/lib/types";

interface UseCouponsReturn {
  validateCoupon: (code: string) => Promise<{ valid: boolean; message?: string; discount?: number }>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => Promise<{ success: boolean }>;
}

export function useCoupons(): UseCouponsReturn {
  const validateCoupon = useCallback(async (code: string) => {
    try {
      const response = await api.post<{
        valid: boolean;
        message?: string;
        discount?: number;
      }>("/coupons/validate", { code: code.toUpperCase() });
      return response;
    } catch (error: any) {
      return {
        valid: false,
        message: error.message || "Invalid coupon code",
      };
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      await api.post("/coupons/apply", { code: code.toUpperCase() });
      return { success: true, message: "Coupon applied successfully" };
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to apply coupon" };
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      await api.post("/coupons/remove", {});
      return { success: true };
    } catch {
      return { success: false };
    }
  }, []);

  return {
    validateCoupon,
    applyCoupon,
    removeCoupon,
  };
}
