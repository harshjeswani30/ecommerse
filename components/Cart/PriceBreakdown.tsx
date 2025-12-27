"use client";

import React, { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/UI/Button";

interface PriceBreakdownProps {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
  couponLoading?: boolean;
}

export function PriceBreakdown({
  subtotal,
  tax,
  discount,
  total,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading = false,
}: PriceBreakdownProps) {
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = () => {
    if (couponInput.trim() && onApplyCoupon) {
      onApplyCoupon(couponInput.trim());
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Order Summary</h3>

      {/* Line Items */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount{couponCode && ` (${couponCode})`}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Tax (18% GST)</span>
          <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      {onApplyCoupon && !couponCode && (
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Button onClick={handleApplyCoupon} loading={couponLoading} size="sm">
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Applied Coupon */}
      {couponCode && onRemoveCoupon && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-green-700">{couponCode} applied</span>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
