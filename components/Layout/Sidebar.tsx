"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function Sidebar({ children, isOpen, onClose, title }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 lg:transform-none lg:static lg:z-0 lg:bg-transparent lg:border-r lg:border-gray-200 lg:h-auto lg:overflow-visible",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col lg:block">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold">{title || "Filters"}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-0 lg:pr-4">
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4 lg:border-none lg:py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full lg:hidden"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className={cn("w-5 h-5 transition-transform", !isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <h3 className="font-medium text-gray-900 mb-3 hidden lg:block">{title}</h3>
      <div className={cn("lg:block", !isOpen && "hidden")}>
        {children}
      </div>
    </div>
  );
}

interface CheckboxFilterProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}

export function CheckboxFilter({ label, value, checked, onChange, count }: CheckboxFilterProps) {
  return (
    <label className="flex items-center gap-3 py-1 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-black peer-checked:border-black transition-colors" />
        <svg
          className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-gray-700 group-hover:text-black transition-colors">{label}</span>
      {count !== undefined && (
        <span className="text-gray-400 text-sm ml-auto">({count})</span>
      )}
    </label>
  );
}

interface PriceRangeProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export function PriceRange({ min, max, value, onChange, step = 100 }: PriceRangeProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="number"
            value={value[0]}
            onChange={(e) => onChange([Number(e.target.value), value[1]])}
            min={min}
            max={max}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Min</p>
        </div>
        <span className="text-gray-400">-</span>
        <div className="flex-1">
          <input
            type="number"
            value={value[1]}
            onChange={(e) => onChange([value[0], Number(e.target.value)])}
            min={min}
            max={max}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Max</p>
        </div>
      </div>
      <input
        type="range"
        value={value[1]}
        onChange={(e) => onChange([value[0], Number(e.target.value)])}
        min={min}
        max={max}
        step={step}
        className="w-full accent-black"
      />
    </div>
  );
}

interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SortSelector({ value, onChange, options }: SortSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
