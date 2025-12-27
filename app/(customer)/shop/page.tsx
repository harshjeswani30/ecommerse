"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Sidebar, FilterSection, CheckboxFilter, PriceRange, SortSelector } from "@/components/Layout/Sidebar";
import { ProductCard } from "@/components/UI/Card";
import { Pagination } from "@/components/UI/Pagination";
import { Product } from "@/lib/types";
import { api } from "@/lib/api";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popularity", label: "Most Popular" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [categories, setCategories] = useState<any[]>([]);
  const [seasons] = useState(["WINTER", "SUMMER", "SPRING", "FALL", "ALL"]);
  const [sizes] = useState(["XS", "S", "M", "L", "XL", "XXL"]);
  const [colors] = useState(["Red", "Blue", "Green", "Yellow", "Black", "White", "Pink", "Purple"]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<any[]>("/categories");
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    const season = searchParams.get("season");
    const search = searchParams.get("search");

    if (category) setSelectedCategory(category);
    if (season) setSelectedSeason(season);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "12");

      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedSeason) params.set("season", selectedSeason);
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
      if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString());
      if (selectedSizes.length) params.set("sizes", selectedSizes.join(","));
      if (selectedColors.length) params.set("colors", selectedColors.join(","));
      if (searchParams.get("search")) params.set("search", searchParams.get("search")!);

      switch (sortBy) {
        case "price_asc":
          params.set("sort", "price_asc");
          break;
        case "price_desc":
          params.set("sort", "price_desc");
          break;
        case "popularity":
          params.set("sort", "popularity");
          break;
      }

      const data = await api.get<{ data: Product[]; total: number; page: number; totalPages: number }>(
        `/products?${params.toString()}`
      );
      setProducts(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, selectedSeason, priceRange, selectedSizes, selectedColors, sortBy, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedSeason("");
    setPriceRange([0, 10000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedSeason,
    priceRange[0] > 0 || priceRange[1] < 10000,
    selectedSizes.length,
    selectedColors.length,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Page Header */}
        <div className="bg-gray-50 py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">
              {searchParams.get("search")
                ? `Search results for "${searchParams.get("search")}"`
                : selectedSeason
                ? `${selectedSeason.charAt(0) + selectedSeason.slice(1).toLowerCase()} Collection`
                : "Shop All Products"}
            </h1>
            <nav className="mt-4 text-sm text-gray-500">
              <Link href="/" className="hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Shop</span>
            </nav>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} title="Filters">
              <div className="space-y-6">
                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear all filters ({activeFiltersCount})
                  </button>
                )}

                {/* Category Filter */}
                <FilterSection title="Category">
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <CheckboxFilter
                        key={cat.id}
                        label={cat.name}
                        value={cat.slug}
                        checked={selectedCategory === cat.slug}
                        onChange={(checked) => {
                          setSelectedCategory(checked ? cat.slug : "");
                          setCurrentPage(1);
                        }}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Season Filter */}
                <FilterSection title="Season">
                  <div className="space-y-1">
                    {seasons.map((season) => (
                      <CheckboxFilter
                        key={season}
                        label={season.charAt(0) + season.slice(1).toLowerCase()}
                        value={season}
                        checked={selectedSeason === season}
                        onChange={(checked) => {
                          setSelectedSeason(checked ? season : "");
                          setCurrentPage(1);
                        }}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Price Filter */}
                <FilterSection title="Price Range">
                  <PriceRange
                    min={0}
                    max={10000}
                    value={priceRange}
                    onChange={(value) => {
                      setPriceRange(value);
                      setCurrentPage(1);
                    }}
                    step={100}
                  />
                </FilterSection>

                {/* Size Filter */}
                <FilterSection title="Size">
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSizes((prev) =>
                            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                          );
                          setCurrentPage(1);
                        }}
                        className={`w-10 h-10 rounded-lg border-2 font-medium transition-all ${
                          selectedSizes.includes(size)
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Color Filter */}
                <FilterSection title="Color">
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColors((prev) =>
                            prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
                          );
                          setCurrentPage(1);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColors.includes(color) ? "border-black scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </FilterSection>
              </div>
            </Sidebar>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-gray-600">
                  Showing {products.length} of {total} products
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <SortSelector
                    value={sortBy}
                    onChange={(value) => {
                      setSortBy(value);
                      setCurrentPage(1);
                    }}
                    options={sortOptions}
                  />
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <ProductCard key={i} product={{} as any} loading />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => window.location.href = `/products/${product.slug}`}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your filters or search terms</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
