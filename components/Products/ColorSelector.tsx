"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string | null;
  onChange: (color: string) => void;
  disabled?: boolean;
  disabledColors?: string[];
}

export function ColorSelector({
  colors,
  selectedColor,
  onChange,
  disabled = false,
  disabledColors = [],
}: ColorSelectorProps) {
  if (colors.length === 0) {
    return null;
  }

  const colorMap: Record<string, string> = {
    Red: "#EF4444",
    Blue: "#3B82F6",
    Green: "#22C55E",
    Yellow: "#EAB308",
    Black: "#000000",
    White: "#FFFFFF",
    Gray: "#6B7280",
    Grey: "#6B7280",
    Pink: "#EC4899",
    Purple: "#A855F7",
    Orange: "#F97316",
    Brown: "#92400E",
    Beige: "#D4C4A8",
    Navy: "#1E3A8A",
    Cream: "#FEF3C7",
    Maroon: "#7F1D1D",
    Olive: "#65A30D",
    Burgundy: "#881337",
    Teal: "#0D9488",
    Lavender: "#C4B5FD",
    Coral: "#FB7185",
    "Light Blue": "#7DD3FC",
    "Dark Blue": "#1E40AF",
    "Light Gray": "#D1D5DB",
    "Dark Gray": "#374151",
  };

  const getColorHex = (color: string) => {
    return colorMap[color] || color;
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">Select Color</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isDisabled = disabledColors.includes(color);
          const isSelected = selectedColor === color;

          return (
            <button
              key={color}
              onClick={() => !isDisabled && onChange(color)}
              disabled={isDisabled || disabled}
              className={cn(
                "group relative w-10 h-10 rounded-full border-2 transition-all",
                isSelected ? "border-black scale-110" : "border-transparent hover:scale-105",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
              title={color}
            >
              <span
                className="absolute inset-1 rounded-full border border-gray-200"
                style={{ backgroundColor: getColorHex(color) }}
              />
              {isSelected && (
                <svg
                  className={cn(
                    "absolute inset-0 m-auto w-5 h-5",
                    ["White", "Cream", "Light Gray", "Beige"].includes(color) ? "text-black" : "text-white"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {selectedColor && (
        <p className="text-sm text-gray-600">
          Selected: <span className="font-medium">{selectedColor}</span>
        </p>
      )}
    </div>
  );
}
