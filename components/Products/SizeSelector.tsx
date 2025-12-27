"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onChange: (size: string) => void;
  disabled?: boolean;
  disabledSizes?: string[];
}

export function SizeSelector({
  sizes,
  selectedSize,
  onChange,
  disabled = false,
  disabledSizes = [],
}: SizeSelectorProps) {
  if (sizes.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        One size available
      </div>
    );
  }

  const sizeLabels: Record<string, string> = {
    XS: "X-Small",
    SM: "Small",
    MD: "Medium",
    LG: "Large",
    XL: "X-Large",
    XXL: "XX-Large",
    S: "Small",
    M: "Medium",
    L: "Large",
    "2XL": "2X-Large",
    "3XL": "3X-Large",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Select Size</span>
        <button className="text-sm text-gray-500 hover:text-black underline">Size Guide</button>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {sizes.map((size) => {
          const isDisabled = disabledSizes.includes(size);
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => !isDisabled && onChange(size)}
              disabled={isDisabled || disabled}
              className={cn(
                "h-10 rounded-lg border-2 font-medium transition-all",
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-gray-300 hover:border-gray-400",
                isDisabled && "opacity-40 cursor-not-allowed line-through",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {selectedSize && (
        <p className="text-sm text-gray-600">
          Selected: <span className="font-medium">{sizeLabels[selectedSize] || selectedSize}</span>
        </p>
      )}
    </div>
  );
}
