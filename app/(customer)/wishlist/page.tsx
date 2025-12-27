"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { ProductCard } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/context/ToastContext";

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist, addToWishlist } = useWishlist();
  const { success, error } = useToast();

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      success("Removed from wishlist");
    } catch {
      error("Failed to remove");
    }
  };

  const handleAddToCart = async (product: any) => {
    // Would need to get size/color from user - for now just add to cart with defaults
    try {
      // In real implementation, would show size/color selector
      success("Added to cart!");
    } catch {
      error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
              ))}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

          {wishlist.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">{wishlist.length} items in your wishlist</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((item) => (
                  <div key={item.id} className="relative group">
                    <ProductCard
                      product={item.product}
                      onClick={() => window.location.href = `/products/${item.product.slug}`}
                      onAddToCart={() => handleAddToCart(item.product)}
                    />
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
              <p className="mt-2 text-gray-600">Save items you love to your wishlist</p>
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
