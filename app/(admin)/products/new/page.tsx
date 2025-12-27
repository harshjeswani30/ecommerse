"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../layout";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/Select";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

export default function NewProductPage() {
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
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post("/products", {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        stock: parseInt(formData.stock),
      });
      success("Product created successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      if (err.message) {
        setErrors({ submit: err.message });
      } else {
        error("Failed to create product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-gray-500 hover:text-black">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
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
                error={errors.price}
                required
              />
              <Input
                label="Discount Price (₹)"
                type="number"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                error={errors.discountPrice}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Season"
                value={formData.season}
                onChange={(value) => setFormData({ ...formData, season: value })}
                options={seasons}
                error={errors.season}
                required
              />
              <Input
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                error={errors.stock}
                required
              />
            </div>

            <Input
              label="Fabric/Material"
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              placeholder="e.g., 100% Cotton"
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

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-gray-600">Drag and drop images here, or click to select</p>
            <p className="text-sm text-gray-500 mt-1">Maximum 5 images, 2MB each</p>
          </div>
        </Card>

        {errors.submit && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">{errors.submit}</div>
        )}

        <div className="flex gap-4 justify-end">
          <Link href="/admin/products">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading}>Create Product</Button>
        </div>
      </form>
    </div>
  );
}
