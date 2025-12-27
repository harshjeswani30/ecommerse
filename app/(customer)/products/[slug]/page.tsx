"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { ProductImage } from "@/components/Products/ProductImage";
import { SizeSelector } from "@/components/Products/SizeSelector";
import { ColorSelector } from "@/components/Products/ColorSelector";
import { ProductCard } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/context/ToastContext";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice, getSeasonBadgeColor } from "@/lib/utils";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart, loading: cartLoading } = useCart();
  const { success, error } = useToast();
  const { fetchRelatedProducts } = useProducts();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.get<Product>(`/products/slug/${slug}`);
        setProduct(data);
        
        if (data?.id) {
          const related = await fetchRelatedProducts(data.id);
          setRelatedProducts(related.slice(0, 4));
        }
      } catch (err) {
        error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) fetchProduct();
  }, [slug, fetchRelatedProducts, error]);

  useEffect(() => {
    if (product?.sizes.length) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors.length) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!selectedSize || !selectedColor) {
      error("Please select both size and color");
      return;
    }

    if (product.stock === 0) {
      error("Product is out of stock");
      return;
    }

    try {
      await addToCart(product, selectedSize, selectedColor, quantity);
      success("Added to cart successfully!");
    } catch (err) {
      error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
            <Link href="/shop" className="mt-4 inline-block text-black underline">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const price = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : null;
  const discountPercent = originalPrice
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <nav className="text-sm text-gray-500">
              <Link href="/" className="hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/shop" className="hover:text-black">Shop</Link>
              <span className="mx-2">/</span>
              <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-black">
                {product.category?.name || "Category"}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Details */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <ProductImage images={product.images} name={product.name} />
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeasonBadgeColor(product.season)}`}>
                  {product.season}
                </span>
                {discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(product.rating!) ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                {originalPrice && (
                  <span className="text-xl text-gray-400 line-through">₹{originalPrice}</span>
                )}
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  product.stock < 5 ? (
                    <p className="text-orange-600 font-medium">Only {product.stock} left in stock!</p>
                  ) : (
                    <p className="text-green-600 font-medium">In Stock ({product.stock} available)</p>
                  )
                ) : (
                  <p className="text-red-600 font-medium">Out of Stock</p>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onChange={setSelectedSize}
                  disabled={product.stock === 0}
                />
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mt-6">
                  <ColorSelector
                    colors={product.colors}
                    selectedColor={selectedColor}
                    onChange={setSelectedColor}
                    disabled={product.stock === 0}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={handleAddToCart}
                  loading={cartLoading}
                  disabled={product.stock === 0}
                  size="lg"
                  className="flex-1"
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button variant="outline" size="lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Button>
              </div>

              {/* Product Details */}
              <div className="mt-8 border-t pt-8 space-y-4">
                {product.fabric && (
                  <div className="flex">
                    <span className="w-32 text-gray-500">Fabric</span>
                    <span className="text-gray-900">{product.fabric}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-32 text-gray-500">Category</span>
                  <span className="text-gray-900">{product.category?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => window.location.href = `/products/${product.slug}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
