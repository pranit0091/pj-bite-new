"use client";

import { useCartStore } from "@/store/useCartStore";
import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShieldCheck, Tag, XCircle, CheckCircle, Truck,
  Banknote, CreditCard, X, Loader2, ArrowRight, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { showError, showWarning, showToast, showSuccess } from "@/lib/swal";
import Image from "next/image";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  on: (event: string, handler: (res: { error: { description: string } }) => void) => void;
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CheckoutSettings {
  freeShippingThreshold?: number;
  shippingCost?: number;
  codCharge?: number;
  prepaidDiscountPercentage?: number;
}

type PaymentMethod = "RAZORPAY" | "COD";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export default function CheckoutSlideOver() {
  const {
    isCheckoutOpen, closeCheckout, items, clearCart,
    appliedCoupon, setAppliedCoupon, buyNowItem, setBuyNowItem,
  } = useCartStore();

  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", street: "", city: "", state: "", zip: "",
  });

  const activeItems = buyNowItem ? [buyNowItem] : items;
  const activeTotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data: CheckoutSettings = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = "hidden";
      fetchSettings();
      if (session?.user) {
        setFormData((prev) => ({
          ...prev,
          name: session.user?.name || "",
          email: session.user?.email || "",
        }));
      }
      if (appliedCoupon) setCouponCode(appliedCoupon.code);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isCheckoutOpen, session, appliedCoupon, fetchSettings]);

  const threshold = settings?.freeShippingThreshold ?? 499;
  const shipCost = settings?.shippingCost ?? 50;
  const isFree = activeTotal >= threshold;
  const shippingCharge = activeTotal > 0 ? (isFree ? 0 : shipCost) : 0;
  const codFee = paymentMethod === "COD" && settings?.codCharge ? settings.codCharge : 0;

  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discountType === "PERCENTAGE"
      ? (activeTotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue;
  }

  const prepaidDiscountPct = settings?.prepaidDiscountPercentage ?? 0;
  const prepaidDiscountAmount = paymentMethod === "RAZORPAY" && prepaidDiscountPct > 0
    ? (activeTotal * prepaidDiscountPct) / 100
    : 0;

  const finalTotal = Math.max(activeTotal + shippingCharge + codFee - discountAmount - prepaidDiscountAmount, 0);

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartValue: activeTotal }),
      });
      if (!res.ok) throw new Error("Failed to validate coupon");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAppliedCoupon(data);
      showToast("Coupon applied!", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to apply coupon";
      setCouponError(message);
      setAppliedCoupon(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "zip" && value.length === 6) fetchAddressFromPin(value);
  };

  const fetchAddressFromPin = async (pincode: string) => {
    setZipLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success") {
        const details = data[0].PostOffice[0];
        setFormData((prev) => ({ ...prev, city: details.District, state: details.State }));
        showToast(`Located ${details.District}, ${details.State}`, "success");
      }
    } catch (err) {
      console.error("PIN lookup failed:", err);
    } finally {
      setZipLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return showError("Not Supported", "Geolocation is not supported by your browser.");
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "User-Agent": "PJBite-Storefront/1.0 (contact@pjbite.com)" } }
          );
          const data = await res.json();
          if (data?.address) {
            const addr = data.address;
            const streetParts = [addr.house_number, addr.road, addr.neighbourhood, addr.suburb, addr.city_district].filter(Boolean);
            const street = streetParts.join(", ");
            let detectedState = addr.state || addr.province || addr.region || addr.state_district;
            if (!detectedState && data.display_name) {
              const parts = data.display_name.split(",").map((s: string) => s.trim());
              if (parts.length >= 3) detectedState = parts[parts.length - 3] || parts[parts.length - 2];
            }
            const rawZip = addr.postcode || "";
            const cleanZip = rawZip.replace(/\s/g, "").match(/\d{6}/)?.[0] || rawZip.split(",")[0].trim();
            setFormData((prev) => ({
              ...prev,
              street: street || prev.street,
              city: addr.city || addr.town || addr.village || addr.municipality || prev.city,
              state: detectedState || prev.state,
              zip: cleanZip || prev.zip,
            }));
            showSuccess("Location Detected", "Your address has been auto-filled.");
          }
        } catch {
          showError("Location Error", "Failed to fetch address details. Please enter manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          showWarning("Permission Denied", "Please allow location access to use this feature.");
        } else {
          showError("Location Error", "Unable to retrieve your location.");
        }
      },
      { timeout: 10000 }
    );
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeItems.length === 0) {
      return showWarning("Your Cart is Empty", "Please add items before proceeding.");
    }

    setLoading(true);
    const rawAddress = { street: formData.street, city: formData.city, state: formData.state, zip: formData.zip };
    const customerDetails = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: `${rawAddress.street}, ${rawAddress.city}, ${rawAddress.state} - ${rawAddress.zip}`,
      city: rawAddress.city,
      state: rawAddress.state,
      pincode: rawAddress.zip,
    };

    if (paymentMethod === "COD") {
      try {
        const cartRes = await fetch("/api/checkout/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: activeItems, customerDetails, couponCode: appliedCoupon?.code }),
        });
        if (!cartRes.ok) throw new Error("Cart validation failed. Please try again.");
        const cartData = await cartRes.json();
        if (cartData.error) throw new Error(cartData.error);

        const codRes = await fetch("/api/checkout/cart-cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productsInfo: cartData.products,
            customerDetails, rawAddress,
            totalAmount: finalTotal,
            couponCode: appliedCoupon?.code,
            discountApplied: discountAmount,
          }),
        });
        if (!codRes.ok) throw new Error("Failed to place COD order. Please try again.");
        const codData = await codRes.json();
        if (!codData.success) throw new Error(codData.error || "Failed to place COD order");

        clearCart();
        setBuyNowItem(null);
        closeCheckout();
        router.push("/dashboard?order=placed&method=cod");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "COD order failed. Please try again.";
        showError("Order Failed", message);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: activeItems, customerDetails, couponCode: appliedCoupon?.code }),
      });
      if (!res.ok) throw new Error("Cart validation failed. Please try again.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        amount: data.amount,
        currency: data.currency,
        name: "PJ Bite",
        description: `Secure Checkout — ${activeItems.length} item${activeItems.length > 1 ? "s" : ""}`,
        order_id: data.id,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/checkout/cart-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productsInfo: data.products,
                customerDetails, rawAddress,
                totalAmount: finalTotal,
                couponCode: appliedCoupon?.code,
                discountApplied: discountAmount,
              }),
            });
            if (!verifyRes.ok) throw new Error("Verification request failed");
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              setBuyNowItem(null);
              closeCheckout();
              router.push("/dashboard?order=placed");
            } else {
              showError("Verification Failed", "Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch {
            showError("Verification Failed", "Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: { name: customerDetails.name, email: customerDetails.email, contact: customerDetails.phone },
        theme: { color: "#1E5C2A" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => {
        showError("Payment Failed", res.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Checkout initialization failed";
      showError("Checkout Error", message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCheckout}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white z-[101] shadow-2xl flex flex-col overflow-hidden sm:rounded-l-[2.5rem]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EDE8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-brand-text font-serif">Secure Checkout</h2>
                  <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest leading-none mt-0.5">
                    Complete your purchase
                  </p>
                </div>
              </div>
              <button
                aria-label="Close checkout"
                onClick={() => { setBuyNowItem(null); closeCheckout(); }}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-bg rounded-full transition-colors text-brand-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <form id="checkout-slide-form" onSubmit={handleCheckoutSubmit} className="p-6 space-y-8">

                {/* 1. Shipping */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                      <span className="w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                      Shipping Details
                    </h3>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locationLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all disabled:opacity-50"
                    >
                      {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                      Locate Me
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {(["name", "email"] as const).map((field) => (
                        <div key={field} className="space-y-1.5">
                          <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                            {field === "name" ? "Full Name" : "Email"}
                          </label>
                          <input
                            type={field === "email" ? "email" : "text"}
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                      <input
                        type="tel" name="phone" value={formData.phone}
                        onChange={handleInputChange} required placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Zip / PIN Code</label>
                        <div className="relative">
                          <input
                            type="text" name="zip" value={formData.zip}
                            onChange={handleInputChange} maxLength={6} required placeholder="6 Digit PIN"
                            className="w-full px-4 py-3 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                          />
                          {zipLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">City</label>
                        <input
                          type="text" name="city" value={formData.city}
                          onChange={handleInputChange} required
                          className="w-full px-4 py-3 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">State</label>
                      <input
                        type="text" name="state" list="indian-states" value={formData.state}
                        onChange={handleInputChange} required placeholder="Select or Type State"
                        className="w-full px-4 py-3 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                      />
                      <datalist id="indian-states">
                        {INDIAN_STATES.map((state) => <option key={state} value={state} />)}
                      </datalist>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Street Address</label>
                      <input
                        type="text" name="street" value={formData.street}
                        onChange={handleInputChange} required placeholder="House No, Street, Landmark"
                        className="w-full px-4 py-3 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="space-y-5">
                  <h3 className="text-sm font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button" onClick={() => setPaymentMethod("RAZORPAY")}
                      className={`flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === "RAZORPAY" ? "border-brand-primary bg-brand-primary/5" : "border-[#E8E6E1] hover:border-brand-primary/30"
                      }`}
                    >
                      <CreditCard className={`w-5 h-5 ${paymentMethod === "RAZORPAY" ? "text-brand-primary" : "text-brand-text-muted"}`} />
                      <span className="text-xs font-black text-brand-text">Online Pay</span>
                    </button>
                    <button
                      type="button" onClick={() => setPaymentMethod("COD")}
                      className={`flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === "COD" ? "border-amber-500 bg-amber-50" : "border-[#E8E6E1] hover:border-amber-400"
                      }`}
                    >
                      <Banknote className={`w-5 h-5 ${paymentMethod === "COD" ? "text-amber-500" : "text-brand-text-muted"}`} />
                      <span className="text-xs font-black text-brand-text">COD (Cash)</span>
                    </button>
                  </div>
                </div>

                {/* 3. Order Summary */}
                <div className="space-y-5">
                  <h3 className="text-sm font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    {activeItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-bg rounded-lg border border-[#E8E6E1] overflow-hidden p-1 shrink-0">
                          <Image src={item.image} alt={item.name} width={48} height={48} className="object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-brand-text truncate">{item.name}</p>
                          <p className="text-[10px] text-brand-text-muted font-bold">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-black text-brand-text whitespace-nowrap">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="pt-4 border-t border-[#F0EDE8]">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/40" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Discount Code"
                          readOnly={!!appliedCoupon}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E6E1] text-xs font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                        />
                      </div>
                      {!appliedCoupon ? (
                        <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 bg-brand-text text-white font-black text-[10px] rounded-xl uppercase tracking-widest">
                          Apply
                        </button>
                      ) : (
                        <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="px-4 py-2 bg-red-100 text-red-600 font-black text-[10px] rounded-xl uppercase tracking-widest">
                          Remove
                        </button>
                      )}
                    </div>
                    {couponError && <p className="text-red-500 text-[10px] font-bold mt-1.5">{couponError}</p>}
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-[#F0EDE8] bg-white space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-brand-text-muted">
                  <span>Subtotal</span>
                  <span className="text-brand-text">₹{activeTotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs font-black text-brand-primary">
                    <span>Discount</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {prepaidDiscountAmount > 0 && (
                  <div className="flex justify-between text-xs font-black text-amber-600">
                    <span>Prepaid Discount ({prepaidDiscountPct}%)</span>
                    <span>- ₹{prepaidDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold text-brand-text-muted">
                  <span>Shipping</span>
                  <span className={isFree ? "text-brand-primary" : "text-brand-text"}>
                    {isFree ? "FREE" : `₹${shipCost.toFixed(2)}`}
                  </span>
                </div>
                {paymentMethod === "COD" && codFee > 0 && (
                  <div className="flex justify-between text-xs font-bold text-amber-600">
                    <span>COD Fee</span>
                    <span>₹{codFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-[#F0EDE8]">
                  <span className="text-sm font-black text-brand-text uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-brand-primary leading-none">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                form="checkout-slide-form"
                type="submit"
                disabled={loading || activeItems.length === 0}
                className="w-full flex items-center justify-center gap-3 bg-brand-primary hover:bg-[#164a20] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {paymentMethod === "COD" ? "Place COD Order" : "Pay Securely"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[9px] font-black text-brand-text-muted uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted Payment
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}