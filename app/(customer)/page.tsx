"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { ProductCard } from "@/components/UI/Card";
import { useProducts } from "@/hooks/useProducts";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";

interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
}

const banners: Banner[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
    title: "Winter Collection 2024",
    subtitle: "Stay warm, stay stylish",
    cta: "Shop Now",
    ctaLink: "/shop?season=WINTER",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    title: "Summer Essentials",
    subtitle: "Light & breezy styles for the season",
    cta: "Explore",
    ctaLink: "/shop?season=SUMMER",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80",
    title: "New Arrivals",
    subtitle: "Fresh styles just dropped",
    cta: "Discover",
    ctaLink: "/shop?new=true",
  },
];

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const { fetchNewArrivals, fetchTrendingProducts, products, loading } = useProducts();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, newRes, trendRes] = await Promise.all([
          api.get<Category[]>("/categories"),
          api.get<any[]>("/products/new?limit=8"),
          api.get<any[]>("/products/trending"),
        ]);
        setCategories(catRes.slice(0, 6));
        setNewArrivals(newRes);
        setTrending(trendRes);
      } catch {
        // Use empty data on error
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Banner */}
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
                    {banner.title}
                  </h1>
                  <p className="text-lg sm:text-xl mb-8 text-gray-200">
                    {banner.subtitle}
                  </p>
                  <Link
                    href={banner.ctaLink}
                    className="inline-block px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
                  >
                    {banner.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Banner Navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentBanner ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-600 mt-2">Explore our diverse range of fashion categories</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">{category.name}</span>
                  </div>
                </Link>
              ))
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))
            )}
          </div>
        </section>

        {/* Trending Products */}
        <section className="py-16 bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                <p className="text-gray-600 mt-1">Hot deals you don't want to miss</p>
              </div>
              <Link
                href="/shop?sort=trending"
                className="text-sm font-medium text-black hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.length > 0 ? (
                trending.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => window.location.href = `/products/${product.slug}`}
                  />
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <ProductCard key={i} product={{} as any} loading />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Seasonal Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Link
              href="/shop?season=WINTER"
              className="relative h-80 rounded-2xl overflow-hidden group"
            >
              <img
                src="https://images.unsplash.com/photo-1545959802-e96596801ac6?w=800&q=80"
                alt="Winter Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-bold mb-2">Winter Collection</h3>
                <p className="text-gray-200">Cozy & stylish essentials</p>
              </div>
            </Link>
            <Link
              href="/shop?season=SUMMER"
              className="relative h-80 rounded-2xl overflow-hidden group"
            >
              <img
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"
                alt="Summer Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-bold mb-2">Summer Vibes</h3>
                <p className="text-gray-200">Light & breezy styles</p>
              </div>
            </Link>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-600 mt-1">Fresh styles just added</p>
            </div>
            <Link
              href="/shop?new=true"
              className="text-sm font-medium text-black hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.length > 0 ? (
              newArrivals.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => window.location.href = `/products/${product.slug}`}
                />
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCard key={i} product={{} as any} loading />
              ))
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-black text-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter and be the first to know about new arrivals, sales, and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
