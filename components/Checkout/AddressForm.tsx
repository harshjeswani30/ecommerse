"use client";

import React, { useState } from "react";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/Select";
import { cn } from "@/lib/utils";
import { Address } from "@/lib/types";

interface AddressFormData {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function AddressForm({ initialData, onSubmit, onCancel, loading }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    pincode: initialData?.pincode || "",
    landmark: initialData?.landmark || "",
    isDefault: initialData?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "PIN code is required";
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Enter a valid 6-digit PIN code";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const indianStates = [
    { value: "", label: "Select State" },
    { value: "Andhra Pradesh", label: "Andhra Pradesh" },
    { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
    { value: "Assam", label: "Assam" },
    { value: "Bihar", label: "Bihar" },
    { value: "Chhattisgarh", label: "Chhattisgarh" },
    { value: "Goa", label: "Goa" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Haryana", label: "Haryana" },
    { value: "Himachal Pradesh", label: "Himachal Pradesh" },
    { value: "Jharkhand", label: "Jharkhand" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Kerala", label: "Kerala" },
    { value: "Madhya Pradesh", label: "Madhya Pradesh" },
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Manipur", label: "Manipur" },
    { value: "Meghalaya", label: "Meghalaya" },
    { value: "Mizoram", label: "Mizoram" },
    { value: "Nagaland", label: "Nagaland" },
    { value: "Odisha", label: "Odisha" },
    { value: "Punjab", label: "Punjab" },
    { value: "Rajasthan", label: "Rajasthan" },
    { value: "Sikkim", label: "Sikkim" },
    { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Telangana", label: "Telangana" },
    { value: "Tripura", label: "Tripura" },
    { value: "Uttar Pradesh", label: "Uttar Pradesh" },
    { value: "Uttarakhand", label: "Uttarakhand" },
    { value: "West Bengal", label: "West Bengal" },
    { value: "Delhi", label: "Delhi" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          required
          maxLength={10}
        />
      </div>

      <Input
        label="Address Line 1"
        value={formData.addressLine1}
        onChange={(e) => handleChange("addressLine1", e.target.value)}
        error={errors.addressLine1}
        placeholder="House No., Street, Area"
        required
      />

      <Input
        label="Address Line 2 (Optional)"
        value={formData.addressLine2}
        onChange={(e) => handleChange("addressLine2", e.target.value)}
        placeholder="Apartment, Floor, Building (if any)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          error={errors.city}
          required
        />
        <Select
          label="State"
          value={formData.state}
          onChange={(value) => handleChange("state", value)}
          options={indianStates}
          error={errors.state}
          required
        />
        <Input
          label="PIN Code"
          value={formData.pincode}
          onChange={(e) => handleChange("pincode", e.target.value)}
          error={errors.pincode}
          required
          maxLength={6}
        />
      </div>

      <Input
        label="Landmark (Optional)"
        value={formData.landmark}
        onChange={(e) => handleChange("landmark", e.target.value)}
        placeholder="Near landmark (if any)"
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => handleChange("isDefault", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
        />
        <span className="text-sm text-gray-700">Set as default address</span>
      </label>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Save Address
        </Button>
      </div>
    </form>
  );
}

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  showActions = false,
}: AddressCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative p-4 border rounded-xl cursor-pointer transition-all",
        isSelected
          ? "border-black bg-gray-50 ring-2 ring-black"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      {address.isDefault && (
        <span className="absolute top-2 right-2 text-xs bg-black text-white px-2 py-1 rounded">
          Default
        </span>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5",
          isSelected ? "border-black bg-black" : "border-gray-300"
        )}>
          {isSelected && (
            <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <p className="font-medium text-gray-900">{address.name}</p>
          <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
          <p className="text-sm text-gray-600 mt-1">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} - {address.pincode}
          </p>
          {address.landmark && (
            <p className="text-sm text-gray-500">Landmark: {address.landmark}</p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-sm text-gray-600 hover:text-black"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
