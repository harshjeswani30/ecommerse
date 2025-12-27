"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Product, PaginatedResponse } from "@/lib/types";

interface ProductFilters {
  category?: string;
  season?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  search?: string;
  sort?: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchProducts: (page?: number, filters?: ProductFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProductBySlug: (slug: string) => Promise<Product | null>;
  fetchRelatedProducts: (productId: string) => Promise<Product[]>;
  fetchTrendingProducts: () => Promise<Product[]>;
  fetchNewArrivals: (limit?: number) => Promise<Product[]>;
  searchProducts: (query: string) => Promise<Product[]>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const buildQueryString = (filters: ProductFilters = {}, page = 1) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", pagination.limit.toString());

    if (filters.category) params.set("category", filters.category);
    if (filters.season) params.set("season", filters.season);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.sizes?.length) params.set("sizes", filters.sizes.join(","));
    if (filters.colors?.length) params.set("colors", filters.colors.join(","));
    if (filters.search) params.set("search", filters.search);
    if (filters.sort) params.set("sort", filters.sort);

    return params.toString();
  };

  const fetchProducts = useCallback(async (page = 1, filters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryString = buildQueryString(filters, page);
      const data = await api.get<PaginatedResponse<Product>>(`/products?${queryString}`);
      setProducts(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const fetchProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const data = await api.get<Product>(`/products/${id}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchProductBySlug = useCallback(async (slug: string): Promise<Product | null> => {
    try {
      const data = await api.get<Product>(`/products/slug/${slug}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchRelatedProducts = useCallback(async (productId: string): Promise<Product[]> => {
    try {
      const data = await api.get<Product[]>(`/products/${productId}/related`);
      return data;
    } catch {
      return [];
    }
  }, []);

  const fetchTrendingProducts = useCallback(async (): Promise<Product[]> => {
    try {
      const data = await api.get<Product[]>("/products/trending");
      return data;
    } catch {
      return [];
    }
  }, []);

  const fetchNewArrivals = useCallback(async (limit = 8): Promise<Product[]> => {
    try {
      const data = await api.get<Product[]>(`/products/new?limit=${limit}`);
      return data;
    } catch {
      return [];
    }
  }, []);

  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    try {
      const data = await api.get<Product[]>(`/products?search=${encodeURIComponent(query)}&limit=10`);
      return data;
    } catch {
      return [];
    }
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProductById,
    fetchProductBySlug,
    fetchRelatedProducts,
    fetchTrendingProducts,
    fetchNewArrivals,
    searchProducts,
  };
}
