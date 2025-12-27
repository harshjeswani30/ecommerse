"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../layout";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Modal, ConfirmModal } from "@/components/UI/Modal";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/Select";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.get<Category[]>("/categories");
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: { name: string; description?: string; parentId?: string }) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, data);
        success("Category updated");
      } else {
        await api.post("/categories", data);
        success("Category created");
      }
      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      error("Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/categories/${deleteId}`);
      success("Category deleted");
      setDeleteId(null);
      fetchCategories();
    } catch {
      error("Failed to delete category");
    }
  };

  const renderCategoryRow = (category: Category, depth = 0) => (
    <tr key={category.id} className="border-b border-gray-100">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span style={{ paddingLeft: `${depth * 20}px` }} className="font-medium">
            {category.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600">{category.description || "-"}</td>
      <td className="px-4 py-3 text-gray-600">{category.productCount || 0}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCategory(category);
              setShowForm(true);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteId(category.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setShowForm(true); }}>
          Add Category
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No categories yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => renderCategoryRow(cat))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingCategory(null); }}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          initialData={editingCategory || undefined}
          categories={categories.filter((c) => c.id !== editingCategory?.id)}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingCategory(null); }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure? Products in this category will not be deleted."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function CategoryForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
}: {
  initialData?: Category;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [parentId, setParentId] = useState(initialData?.parentId || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description, parentId: parentId || undefined });
      }}
      className="space-y-4"
    >
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <Select
        label="Parent Category (optional)"
        value={parentId}
        onChange={setParentId}
        options={[
          { value: "", label: "None (Top Level)" },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <div className="flex gap-4 justify-end pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
