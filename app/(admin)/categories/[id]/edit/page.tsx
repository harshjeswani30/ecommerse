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
import { Category } from "@/lib/types";

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await api.get<Category>(`/categories/${categoryId}`);
        setFormData({
          name: category.name,
          description: category.description || "",
          parentId: category.parentId || "",
        });
      } catch {
        error("Category not found");
        router.push("/admin/categories");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchCategory();
  }, [categoryId, router, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/categories/${categoryId}`, formData);
      success("Category updated!");
      router.push("/admin/categories");
    } catch {
      error("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="text-gray-500 hover:text-black">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
          <p className="text-gray-600 mt-1">Update category information</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <Select
            label="Parent Category (optional)"
            value={formData.parentId}
            onChange={(value) => setFormData({ ...formData, parentId: value })}
            options={[
              { value: "", label: "None (Top Level)" },
            ]}
          />

          <div className="flex gap-4 justify-end pt-4">
            <Link href="/admin/categories">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
