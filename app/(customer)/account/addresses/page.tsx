"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/Select";
import { Card } from "@/components/UI/Card";
import { Modal, ConfirmModal } from "@/components/UI/Modal";
import { AddressForm, AddressCard } from "@/components/Checkout/AddressForm";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/hooks/useAddresses";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { Address } from "@/lib/types";

export default function AddressesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addresses, loading, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const { success, error } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
              <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
            </div>
            <Button
              onClick={() => {
                setEditingAddress(null);
                setShowForm(true);
              }}
            >
              Add New Address
            </Button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isSelected={false}
                  onSelect={() => {}}
                  onEdit={() => {
                    setEditingAddress(address);
                    setShowForm(true);
                  }}
                  onDelete={() => setDeleteId(address.id)}
                  showActions
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <h2 className="mt-6 text-xl font-bold text-gray-900">No addresses yet</h2>
              <p className="mt-2 text-gray-600">Add an address to make checkout faster</p>
              <Button className="mt-6" onClick={() => setShowForm(true)}>
                Add Your First Address
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Address Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="lg"
      >
        <AddressForm
          initialData={editingAddress || undefined}
          onSubmit={async (data) => {
            if (editingAddress?.id) {
              await updateAddress(editingAddress.id, data);
            } else {
              await addAddress(data);
            }
            success(editingAddress ? "Address updated" : "Address added");
            setShowForm(false);
            setEditingAddress(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteAddress(deleteId);
            success("Address deleted");
            setDeleteId(null);
          }
        }}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
