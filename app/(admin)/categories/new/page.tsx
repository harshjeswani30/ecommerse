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
import { Category } from "@/lib/types";

export default function NewCategoryPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="text-gray-500 hover:text-black">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Category</h1>
          <p className="text-gray-600 mt-1">Create a new product category</p>
        </div>
      </div>

      <Card>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              await api.post("/categories", {
                name: formData.name,
                description: formData.description,
                parentId: formData.parentId || undefined,
              });
              success("Category created!");
              router.push("/admin/categories");
            } catch (err) {
              error("Failed to create category");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
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
            <Button type="submit" loading={loading}>Create Category</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
