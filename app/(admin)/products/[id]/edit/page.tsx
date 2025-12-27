"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../../layout";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/Select";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    season: "",
    stock: "",
    categoryId: "",
    sizes: [] as string[],
    colors: [] as string[],
    fabric: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await api.get<Product>(`/products/${productId}`);
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          discountPrice: product.discountPrice?.toString() || "",
          season: product.season,
          stock: product.stock.toString(),
          categoryId: product.categoryId,
          sizes: product.sizes,
          colors: product.colors,
          fabric: product.fabric || "",
        });
      } catch (err) {
        error("Product not found");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId, router, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/products/${productId}`, {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        stock: parseInt(formData.stock),
      });
      success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      await api.delete(`/products/${productId}`);
      success("Product deleted successfully!");
      router.push("/admin/products");
    } catch (err) {
      error("Failed to delete product");
    }
  };

  const seasons = [
    { value: "", label: "Select Season" },
    { value: "WINTER", label: "Winter" },
    { value: "SUMMER", label: "Summer" },
    { value: "SPRING", label: "Spring" },
    { value: "FALL", label: "Fall" },
    { value: "ALL", label: "All Seasons" },
  ];

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const colorOptions = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Pink", "Purple", "Brown", "Gray"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="text-gray-500 hover:text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update product information</p>
          </div>
        </div>
        <Button variant="danger" onClick={handleDelete}>Delete Product</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                label="Discount Price (₹)"
                type="number"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Season"
                value={formData.season}
                onChange={(value) => setFormData({ ...formData, season: value })}
                options={seasons}
                required
              />
              <Input
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <Input
              label="Fabric/Material"
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Variants</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      sizes: formData.sizes.includes(size)
                        ? formData.sizes.filter((s) => s !== size)
                        : [...formData.sizes, size],
                    });
                  }}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    formData.sizes.includes(size)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      colors: formData.colors.includes(color)
                        ? formData.colors.filter((c) => c !== color)
                        : [...formData.colors, color],
                    });
                  }}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    formData.colors.includes(color)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex gap-4 justify-end">
          <Link href="/admin/products">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
