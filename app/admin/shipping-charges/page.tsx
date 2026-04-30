"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, RotateCcw, IndianRupee, Truck, CreditCard, Tag, Percent } from "lucide-react";
import { showToast, showError } from "@/lib/swal";

interface StoreSettings {
  freeShippingThreshold: number;
  shippingCost: number;
  codCharge: number;
  isCodEnabled: boolean;
  prepaidDiscountPercentage: number;
}

const DEFAULTS: StoreSettings = {
  freeShippingThreshold: 499,
  shippingCost: 49,
  codCharge: 50,
  isCodEnabled: true,
  prepaidDiscountPercentage: 0,
};

function FieldCard({ icon: Icon, label, hint, children }: {
  icon: React.ElementType;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/8 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
          <p className="font-black text-brand-text text-sm">{label}</p>
          {hint && <p className="text-xs text-brand-text-muted mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AdminShippingChargesPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
  const [original, setOriginal] = useState<StoreSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store-settings");
      const data = await res.json();
      if (res.ok && data.data) {
        const s: StoreSettings = {
          freeShippingThreshold: data.data.freeShippingThreshold,
          shippingCost: data.data.shippingCost,
          codCharge: data.data.codCharge,
          isCodEnabled: data.data.isCodEnabled,
          prepaidDiscountPercentage: data.data.prepaidDiscountPercentage,
        };
        setSettings(s);
        setOriginal(s);
      }
    } catch {
      showError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/store-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const s: StoreSettings = {
        freeShippingThreshold: data.data.freeShippingThreshold,
        shippingCost: data.data.shippingCost,
        codCharge: data.data.codCharge,
        isCodEnabled: data.data.isCodEnabled,
        prepaidDiscountPercentage: data.data.prepaidDiscountPercentage,
      };
      setSettings(s);
      setOriginal(s);
      showToast("Shipping charges saved!", "success");
    } catch (err: any) {
      showError("Failed to save", err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof StoreSettings, value: any) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-text font-serif tracking-tight">Shipping Charges</h1>
          <p className="text-brand-text-muted mt-1 font-medium">Configure delivery fees, COD charges, and prepaid discounts.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={() => setSettings(original)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E8E6E1] text-brand-text-muted text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Unsaved banner */}
      {isDirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3 text-amber-800 text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          You have unsaved changes
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Free Shipping Threshold */}
        <FieldCard
          icon={Truck}
          label="Free Shipping Above"
          hint="Orders at or above this amount get free delivery"
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-sm">₹</span>
            <input
              type="number"
              min={0}
              value={settings.freeShippingThreshold}
              onChange={e => set("freeShippingThreshold", Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <p className="text-xs text-brand-text-muted">
            Currently: free shipping on orders ₹{settings.freeShippingThreshold}+
          </p>
        </FieldCard>

        {/* Flat Shipping Cost */}
        <FieldCard
          icon={IndianRupee}
          label="Flat Shipping Fee"
          hint="Charged on orders below the free shipping threshold"
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-sm">₹</span>
            <input
              type="number"
              min={0}
              value={settings.shippingCost}
              onChange={e => set("shippingCost", Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <p className="text-xs text-brand-text-muted">
            Orders under ₹{settings.freeShippingThreshold} will be charged ₹{settings.shippingCost}
          </p>
        </FieldCard>

        {/* COD Charge */}
        <FieldCard
          icon={CreditCard}
          label="Cash on Delivery (COD) Charge"
          hint="Extra fee applied when customer selects COD"
        >
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => set("isCodEnabled", !settings.isCodEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${settings.isCodEnabled ? "bg-brand-primary" : "bg-gray-200"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.isCodEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </div>
              <span className="text-sm font-bold text-brand-text">
                COD {settings.isCodEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-sm">₹</span>
            <input
              type="number"
              min={0}
              disabled={!settings.isCodEnabled}
              value={settings.codCharge}
              onChange={e => set("codCharge", Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </FieldCard>

        {/* Prepaid Discount */}
        <FieldCard
          icon={Percent}
          label="Prepaid Order Discount"
          hint="Percentage discount for customers who pay online (set 0 to disable)"
        >
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={settings.prepaidDiscountPercentage}
              onChange={e => set("prepaidDiscountPercentage", Math.min(100, Number(e.target.value)))}
              className="w-full pr-10 pl-4 py-3 border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-sm">%</span>
          </div>
          <p className="text-xs text-brand-text-muted">
            {settings.prepaidDiscountPercentage > 0
              ? `Prepaid orders get ${settings.prepaidDiscountPercentage}% off`
              : "No prepaid discount currently active"}
          </p>
        </FieldCard>
      </div>

      {/* Summary preview */}
      <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6">
        <h2 className="text-sm font-black text-brand-text-muted uppercase tracking-widest mb-4">Preview — How Customers See It</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-brand-bg rounded-xl p-4">
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-1">Standard Delivery</p>
            <p className="text-2xl font-black text-brand-primary">₹{settings.shippingCost}</p>
            <p className="text-xs text-brand-text-muted mt-1">on orders below ₹{settings.freeShippingThreshold}</p>
          </div>
          <div className="bg-brand-bg rounded-xl p-4">
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-1">Free Shipping</p>
            <p className="text-2xl font-black text-green-600">₹0</p>
            <p className="text-xs text-brand-text-muted mt-1">on orders ₹{settings.freeShippingThreshold}+</p>
          </div>
          <div className="bg-brand-bg rounded-xl p-4">
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-1">COD Extra Charge</p>
            <p className={`text-2xl font-black ${settings.isCodEnabled ? "text-amber-600" : "text-gray-400"}`}>
              {settings.isCodEnabled ? `₹${settings.codCharge}` : "Disabled"}
            </p>
            <p className="text-xs text-brand-text-muted mt-1">
              {settings.isCodEnabled ? "added to COD orders" : "COD not available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
