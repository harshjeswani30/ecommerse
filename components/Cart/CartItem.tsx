"use client";

import React from "react";
import { cn, formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: {
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      price: number;
    };
    quantity: number;
    size: string;
    color: string;
    priceAtAddition: number;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onMoveToWishlist?: () => void;
  loading?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, onMoveToWishlist, loading }: CartItemProps) {
  const { product, quantity, size, color } = item;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Size: {size} • Color: {color}
            </p>
          </div>
          <button
            onClick={onRemove}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
              disabled={loading || quantity <= 1}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-3 py-1 font-medium text-gray-900">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              disabled={loading}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatPrice(item.priceAtAddition * quantity)}
            </p>
            <p className="text-xs text-gray-500">{formatPrice(item.priceAtAddition)} each</p>
          </div>
        </div>

        {/* Move to Wishlist */}
        {onMoveToWishlist && (
          <button
            onClick={onMoveToWishlist}
            disabled={loading}
            className="mt-2 text-sm text-gray-500 hover:text-black underline"
          >
            Move to Wishlist
          </button>
        )}
      </div>
    </div>
  );
}
