"use client";

import React, { SelectHTMLAttributes, forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  searchable?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder = "Select...", onChange, searchable = false, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = searchable
      ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
      : options;

    const selectedOption = options.find((opt) => opt.value === props.value);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className="hidden"
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full px-3 py-2 border rounded-lg shadow-sm text-left bg-white",
              "focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              error ? "border-red-500" : "border-gray-300",
              "flex items-center justify-between"
            )}
          >
            <span className={cn(!selectedOption && "text-gray-400")}>
              {selectedOption?.label || placeholder}
            </span>
            <svg
              className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchable && (
                <div className="p-2 border-b">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              )}
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange?.(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-gray-100",
                    props.value === opt.value && "bg-gray-50",
                    opt.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {opt.label}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-sm">No results found</div>
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
