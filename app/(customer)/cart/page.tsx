"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { CartItem } from "@/components/Cart/CartItem";
import { PriceBreakdown } from "@/components/Cart/PriceBreakdown";
import { Button } from "@/components/UI/Button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/context/ToastContext";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, applyCoupon, removeCoupon } = useCart();
  const { success, error } = useToast();

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch {
      error("Failed to update quantity");
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      success("Item removed from cart");
    } catch {
      error("Failed to remove item");
    }
  };

  const handleApplyCoupon = async (code: string) => {
    try {
      await applyCoupon(code);
      success("Coupon applied successfully!");
    } catch (err: any) {
      error(err.message || "Invalid coupon code");
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-600">Looks like you haven't added anything to your cart yet.</p>
              <Link
                href="/shop"
                className="mt-6 inline-block px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6">
                      <CartItem
                        item={item}
                        onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                        onRemove={() => handleRemove(item.id)}
                        loading={loading}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  href="/shop"
                  className="text-sm text-gray-600 hover:text-black flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <PriceBreakdown
                  subtotal={cart.subtotal}
                  tax={cart.tax}
                  discount={cart.discount}
                  total={cart.total}
                  couponCode={cart.couponCode}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={removeCoupon}
                />

                <Link href="/checkout">
                  <Button className="w-full mt-4" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure checkout powered by Razorpay
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Placeholder for recommendations */}
              <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
