"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ children, className, hover = false, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        hover && "hover:shadow-md transition-shadow duration-200",
        padding && "p-4 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    season: string;
    stock: number;
    rating?: number;
    reviewCount?: number;
  };
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onClick?: () => void;
  loading?: boolean;
}

export function ProductCard({ product, onAddToCart, onAddToWishlist, onClick, loading }: ProductCardProps) {
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
      </Card>
    );
  }

  return (
    <Card hover className="group relative">
      <button
        onClick={onClick}
        className="w-full text-left"
      >
        <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100 relative">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              {discountPercent}% OFF
            </span>
          )}
          
          <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded ${
            product.season === "WINTER" ? "bg-blue-100 text-blue-800" :
            product.season === "SUMMER" ? "bg-yellow-100 text-yellow-800" :
            product.season === "SPRING" ? "bg-green-100 text-green-800" :
            product.season === "FALL" ? "bg-orange-100 text-orange-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {product.season}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist?.();
            }}
            className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
        
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-gray-600">{product.rating}</span>
            {product.reviewCount && (
              <span className="text-sm text-gray-400">({product.reviewCount})</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
          )}
        </div>

        <div className="mt-2">
          {product.stock > 0 ? (
            product.stock < 5 ? (
              <span className="text-xs text-orange-600">Only {product.stock} left</span>
            ) : (
              <span className="text-xs text-green-600">In Stock</span>
            )
          ) : (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>
      </button>

      <button
        onClick={onAddToCart}
        disabled={product.stock === 0}
        className="w-full mt-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Add to Cart
      </button>
    </Card>
  );
}

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    itemCount: number;
  };
  onViewDetails?: () => void;
  onTrackOrder?: () => void;
}

export function OrderCard({ order, onViewDetails, onTrackOrder }: OrderCardProps) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PACKED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <p className="text-sm text-gray-500">{order.itemCount} items</p>
          <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onTrackOrder}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Track
          </button>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </Card>
  );
}
