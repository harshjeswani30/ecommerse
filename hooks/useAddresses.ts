"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Address } from "@/lib/types";

interface UseAddressesReturn {
  addresses: Address[];
  loading: boolean;
  fetchAddresses: () => Promise<void>;
  addAddress: (data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateAddress: (id: string, data: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export function useAddresses(): UseAddressesReturn {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Address[]>("/addresses");
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = useCallback(async (data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">) => {
    const newAddress = await api.post<Address>("/addresses", data);
    setAddresses((prev) => [...prev, newAddress]);
  }, []);

  const updateAddress = useCallback(async (id: string, data: Partial<Address>) => {
    const updated = await api.put<Address>(`/addresses/${id}`, data);
    setAddresses((prev) => prev.map((addr) => (addr.id === id ? updated : addr)));
  }, []);

  const deleteAddress = useCallback(async (id: string) => {
    await api.delete(`/addresses/${id}`);
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  }, []);

  const setDefaultAddress = useCallback(async (id: string) => {
    await api.put(`/addresses/${id}/default`, {});
    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, isDefault: addr.id === id }))
    );
  }, []);

  return {
    addresses,
    loading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
