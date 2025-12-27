"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { AddressForm, AddressCard } from "@/components/Checkout/AddressForm";
import { PriceBreakdown } from "@/components/Cart/PriceBreakdown";
import { OrderItems } from "@/components/Orders/OrderTimeline";
import { Button } from "@/components/UI/Button";
import { Modal } from "@/components/UI/Modal";
import { useCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { useToast } from "@/context/ToastContext";
import { Address } from "@/lib/types";
import { api } from "@/lib/api";

const steps = [
  { id: 1, name: "Cart", href: "/cart" },
  { id: 2, name: "Shipping", current: true },
  { id: 3, name: "Payment", href: "/checkout/payment" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, itemCount } = useCart();
  const { addresses, addAddress, loading: addressesLoading } = useAddresses();
  const { success, error } = useToast();

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      setSelectedAddress(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses]);

  const handleAddAddress = async (data: any) => {
    try {
      await addAddress(data);
      success("Address added successfully!");
      setShowAddressForm(false);
    } catch {
      error("Failed to add address");
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      error("Please select a shipping address");
      return;
    }
    if (!acceptTerms) {
      error("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderRes = await api.post<{ id: string; orderNumber: string }>("/orders", {
        addressId: selectedAddress,
        couponCode: cart?.couponCode,
      });

      // Initiate payment
      const paymentRes = await api.post<{
        razorpayOrderId: string;
        amount: number;
        keyId: string;
      }>("/payments/initiate", {
        orderId: orderRes.id,
      });

      // Store order ID for payment page
      localStorage.setItem("pendingOrderId", orderRes.id);
      router.push("/checkout/payment");
    } catch (err: any) {
      error(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (itemCount === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-black">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/cart" className="hover:text-black">Cart</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>

          {/* Progress Steps */}
          <div className="mb-8">
            <ol className="flex items-center">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-center">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      step.current
                        ? "bg-black text-white"
                        : index < 1
                        ? "bg-gray-200 text-gray-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.id}
                  </span>
                  <span
                    className={`ml-2 text-sm ${
                      step.current ? "text-gray-900 font-medium" : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="mx-4 text-gray-300">/</span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}>
                    Add New Address
                  </Button>
                </div>

                {addressesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        isSelected={selectedAddress === address.id}
                        onSelect={() => setSelectedAddress(address.id)}
                        onEdit={() => {
                          setEditingAddress(address);
                          setShowAddressForm(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No addresses saved</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowAddressForm(true)}
                    >
                      Add Address
                    </Button>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <OrderItems items={cart?.items || []} />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: "razorpay", name: "Razorpay", desc: "UPI, Cards, NetBanking, Wallets" },
                    { id: "upi", name: "UPI", desc: "Google Pay, PhonePe, Paytm" },
                    { id: "cod", name: "Cash on Delivery", desc: "Pay when you receive" },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id ? "border-black" : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === method.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-black underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-black underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <PriceBreakdown
                  subtotal={cart?.subtotal || 0}
                  tax={cart?.tax || 0}
                  discount={cart?.discount || 0}
                  total={cart?.total || 0}
                  couponCode={cart?.couponCode}
                />

                <Button
                  onClick={handleProceedToPayment}
                  loading={loading}
                  disabled={!selectedAddress || !acceptTerms}
                  className="w-full mt-6"
                  size="lg"
                >
                  Proceed to Payment
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Your personal data will be used to process your order and support your experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Address Form Modal */}
      <Modal
        isOpen={showAddressForm}
        onClose={() => {
          setShowAddressForm(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="lg"
      >
        <AddressForm
          initialData={editingAddress || undefined}
          onSubmit={handleAddAddress}
          onCancel={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
          loading={addressesLoading}
        />
      </Modal>
    </div>
  );
}
