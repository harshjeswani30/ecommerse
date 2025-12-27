"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../layout";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Pagination } from "@/components/UI/Pagination";
import { api } from "@/lib/api";
import { User } from "@/lib/types";

interface StaffMember extends User {
  permissions?: {
    canAddProducts: boolean;
    canEditProducts: boolean;
    canDeleteProducts: boolean;
    canManageCategories: boolean;
  };
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await api.get<StaffMember[]>("/staff");
        setStaff(data);
      } catch {
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    
    try {
      await api.delete(`/staff/${id}`);
      setStaff(staff.filter((s) => s.id !== id));
    } catch {
      alert("Failed to remove staff member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage staff members and permissions</p>
        </div>
        <Link href="/admin/staff/new">
          <Button>Add Staff Member</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Permissions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No staff members yet</td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {member.permissions?.canAddProducts && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Add</span>
                        )}
                        {member.permissions?.canEditProducts && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Edit</span>
                        )}
                        {member.permissions?.canDeleteProducts && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Delete</span>
                        )}
                        {member.permissions?.canManageCategories && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">Categories</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/staff/${member.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(member.id)}>
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
