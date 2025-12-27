"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../../layout";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { User } from "@/lib/types";

interface StaffPermissions {
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canManageCategories: boolean;
}

export default function EditStaffPage() {
  const params = useParams();
  const staffId = params.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [permissions, setPermissions] = useState<StaffPermissions>({
    canAddProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canManageCategories: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staff = await api.get<User & { permissions: StaffPermissions }>(`/staff/${staffId}`);
        setFormData({
          name: staff.name,
          email: staff.email,
        });
        setPermissions(staff.permissions || {
          canAddProducts: false,
          canEditProducts: false,
          canDeleteProducts: false,
          canManageCategories: false,
        });
      } catch {
        error("Staff member not found");
        router.push("/admin/staff");
      } finally {
        setLoading(false);
      }
    };

    if (staffId) fetchStaff();
  }, [staffId, router, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/staff/${staffId}`, {
        name: formData.name,
        email: formData.email,
        permissions,
      });
      success("Staff member updated!");
      router.push("/admin/staff");
    } catch {
      error("Failed to update staff member");
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
        <Link href="/admin/staff" className="text-gray-500 hover:text-black">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Staff Member</h1>
          <p className="text-gray-600 mt-1">Update staff information and permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h2>
          <div className="space-y-3">
            {[
              { key: "canAddProducts", label: "Can Add Products" },
              { key: "canEditProducts", label: "Can Edit Products" },
              { key: "canDeleteProducts", label: "Can Delete Products" },
              { key: "canManageCategories", label: "Can Manage Categories" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions[key as keyof StaffPermissions]}
                  onChange={(e) =>
                    setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex gap-4 justify-end">
          <Link href="/admin/staff">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
