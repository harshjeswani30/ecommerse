"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface CategoryMenuProps {
  variant?: "header" | "sidebar";
}

export function CategoryMenu({ variant = "header" }: CategoryMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.data || []);
      } catch {
        // Use empty categories on error
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const renderCategoryItem = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    if (variant === "header") {
      return (
        <div key={category.id} className="relative group">
          <Link
            href={`/shop?category=${category.slug}`}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-black font-medium transition-colors"
          >
            {category.name}
            {hasChildren && (
              <svg
                className="w-4 h-4 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Link>

          {hasChildren && (
            <div className="absolute left-0 top-full w-64 bg-white rounded-xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                {category.children!.map((child) => renderCategoryItem(child, depth + 1))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={category.id}>
        <button
          onClick={() => hasChildren && toggleCategory(category.id)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors",
            hasChildren ? "cursor-pointer hover:bg-gray-100" : "cursor-pointer hover:bg-gray-100"
          )}
        >
          <Link
            href={`/shop?category=${category.slug}`}
            className="text-gray-700 hover:text-black"
            onClick={(e) => hasChildren && e.preventDefault()}
          >
            {category.name}
          </Link>
          {hasChildren && (
            <svg
              className={cn("w-4 h-4 text-gray-400 transition-transform", isExpanded && "rotate-180")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 border-l border-gray-200 pl-3 space-y-1">
            {category.children!.map((child) => renderCategoryItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (variant === "sidebar") {
    return (
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 px-3 py-2">Categories</h3>
        {categories.length > 0 ? (
          categories.map((category) => renderCategoryItem(category))
        ) : (
          <div className="px-3 py-4 text-center text-gray-500">
            <p>No categories available</p>
            <p className="text-sm mt-1">Check back later</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {categories.length > 0 ? (
        categories.map((category) => renderCategoryItem(category))
      ) : (
        <Link href="/shop" className="px-3 py-2 text-gray-700 hover:text-black font-medium">
          Shop
        </Link>
      )}
    </div>
  );
}
