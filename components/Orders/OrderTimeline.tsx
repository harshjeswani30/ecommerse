"use client";

import React from "react";
import { cn, formatDate, formatPrice, getStatusColor } from "@/lib/utils";
import { OrderStatusHistory } from "@/lib/types";

interface OrderTimelineProps {
  statusHistory: OrderStatusHistory[];
  currentStatus: string;
}

const statusOrder = [
  "PENDING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const statusLabels: Record<string, string> = {
  PENDING: "Order Placed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

export function OrderTimeline({ statusHistory, currentStatus }: OrderTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {statusOrder.map((status, index) => {
          const historyEntry = statusHistory.find(
            (entry) => entry.status === status
          );
          const isCompleted = index <= currentIndex;
          const isCurrent = status === currentStatus;

          return (
            <div key={status} className="relative flex items-start gap-4">
              {/* Status Dot */}
              <div
                className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  isCompleted ? "bg-black text-white" : "bg-gray-200 text-gray-500",
                  isCurrent && "ring-4 ring-black/20"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-2 h-2 bg-current rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      isCompleted ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {statusLabels[status]}
                  </span>
                  {isCurrent && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(status))}>
                      Current
                    </span>
                  )}
                </div>
                {historyEntry && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(historyEntry.timestamp)}
                    {historyEntry.note && ` • ${historyEntry.note}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OrderItemsProps {
  items: {
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
    quantity: number;
    size: string;
    color: string;
    priceAtAddition?: number;
    priceAtPurchase?: number;
  }[];
  readonly?: boolean;
}

export function OrderItems({ items, readonly = false }: OrderItemsProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {item.product.images[0] ? (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
            <p className="text-sm text-gray-500">
              Qty: {item.quantity} • Size: {item.size} • Color: {item.color}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatPrice((item.priceAtPurchase || item.priceAtAddition || 0) * item.quantity)}
            </p>
            <p className="text-sm text-gray-500">{formatPrice(item.priceAtPurchase || item.priceAtAddition || 0)} each</p>
          </div>
        </div>
      ))}
    </div>
  );
}
