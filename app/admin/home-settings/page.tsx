"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { showToast, showError } from "@/lib/swal";

interface TrustItem { label: string; subline: string; iconType: string }
interface BenefitItem { label: string; sub: string; iconName: string }
interface PurposeItem { label: string; iconName: string; href: string }
interface WhyItem { title: string; desc: string; iconName: string }
interface HowItem { step: string; label: string; desc: string; iconName: string }
interface BulkOrder { badge: string; title: string; subtitle: string }

interface HomeSettings {
  trustStrip: TrustItem[];
  benefits: BenefitItem[];
  purposes: PurposeItem[];
  qualityClaims: string[];
  whyPjBite: WhyItem[];
  howItWorks: HowItem[];
  bulkOrder: BulkOrder;
}

const TRUST_ICON_OPTIONS = ["no-color", "no-sugar", "no-chemical", "no-flavor"];
const LUCIDE_ICON_OPTIONS = ["Truck", "Shield", "Leaf", "Award", "Gift", "Sprout", "Utensils", "Dumbbell", "Sun", "CheckCircle", "Package", "Star"];

const DEFAULT: HomeSettings = {
  trustStrip: [
    { label: "No Colour Added", subline: "100% Raw Nature", iconType: "no-color" },
    { label: "No Added Sugar", subline: "Natural Fruit Sugars", iconType: "no-sugar" },
    { label: "No Chemical", subline: "Zero Toxins", iconType: "no-chemical" },
    { label: "No Flavour", subline: "Authentic Taste", iconType: "no-flavor" },
  ],
  benefits: [
    { label: "Free Shipping", sub: "On Orders Above ₹499", iconName: "Truck" },
    { label: "100% Natural", sub: "No Preservatives Added", iconName: "Shield" },
    { label: "Farm Direct", sub: "Sourced From Farmers", iconName: "Leaf" },
    { label: "Quality Assured", sub: "FSSAI Licensed Lab Tested", iconName: "Award" },
  ],
  purposes: [
    { label: "Gifting", iconName: "Gift", href: "/products?category=gifts" },
    { label: "Snacking", iconName: "Sprout", href: "/products?category=snacks" },
    { label: "Cooking", iconName: "Utensils", href: "/products?category=cooking" },
    { label: "Fitness", iconName: "Dumbbell", href: "/products?category=fitness" },
  ],
  qualityClaims: [
    "✔ 100% Natural", "✔ No Added Sugar*", "✔ No Preservatives",
    "✔ No Artificial Colors or Flavours", "✔ Farm Direct Sourcing",
    "✔ Hygienically Processed", "✔ Clean Label Product",
  ],
  whyPjBite: [
    { title: "No Chemicals Ever", desc: "We never use artificial preservatives, colors, or flavor enhancers. What you eat is exactly what nature made.", iconName: "Leaf" },
    { title: "Farm-to-Door", desc: "We partner directly with farmers, cutting out middlemen so you get fresher produce at better prices.", iconName: "Sprout" },
    { title: "Natural Dehydration", desc: "Using sun-drying and modern dehydration tech to preserve nutrients, taste, and texture naturally.", iconName: "Sun" },
  ],
  howItWorks: [
    { step: "01", label: "Farm Sourcing", desc: "Direct from ethical farmers", iconName: "Leaf" },
    { step: "02", label: "Natural Drying", desc: "Zero chemical processing", iconName: "Sun" },
    { step: "03", label: "Quality Check", desc: "Premium quality standards", iconName: "CheckCircle" },
    { step: "04", label: "Doorstep Delivery", desc: "Fresh & sealed arrival", iconName: "Truck" },
  ],
  bulkOrder: {
    badge: "Corporate & Wholesale",
    title: "Big Savings on Bulk Orders! 🥜",
    subtitle: "Contact our team for special pricing on bulk dry fruit orders for events, gifting, and retail.",
  },
};

export default function AdminHomeSettingsPage() {
  const [settings, setSettings] = useState<HomeSettings>(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"trust" | "benefits" | "purposes" | "claims" | "why" | "how" | "bulk">("trust");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/home-settings");
        const data = await res.json();
        if (res.ok && data.data) setSettings(data.data);
      } catch {
        showError("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/home-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      showToast("Settings saved!", "success");
    } catch (err: any) {
      showError("Save failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "trust", label: "Trust Strip" },
    { id: "benefits", label: "Benefits" },
    { id: "purposes", label: "Purposes" },
    { id: "claims", label: "Claims Marquee" },
    { id: "why", label: "Why PJ Bite" },
    { id: "how", label: "How It Works" },
    { id: "bulk", label: "Bulk Order" },
  ] as const;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-text font-serif tracking-tight">Home Settings</h1>
          <p className="text-brand-text-muted mt-1 font-medium">Manage static content sections on the home page.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark disabled:opacity-70 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Changes
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-[#E8E6E1]/50 rounded-xl">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white text-brand-primary shadow-sm" : "text-brand-text-muted hover:text-brand-text"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm p-6">

        {/* Trust Strip */}
        {activeTab === "trust" && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-brand-text-muted">The 4 badge items below the hero banner (e.g. "No Colour Added").</p>
            {settings.trustStrip.map((item, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-brand-bg/30 rounded-xl border border-[#E8E6E1]">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Label</label>
                  <input value={item.label} onChange={e => {
                    const arr = [...settings.trustStrip];
                    arr[i] = { ...arr[i], label: e.target.value };
                    setSettings({ ...settings, trustStrip: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Subline</label>
                  <input value={item.subline} onChange={e => {
                    const arr = [...settings.trustStrip];
                    arr[i] = { ...arr[i], subline: e.target.value };
                    setSettings({ ...settings, trustStrip: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Icon Type</label>
                  <select value={item.iconType} onChange={e => {
                    const arr = [...settings.trustStrip];
                    arr[i] = { ...arr[i], iconType: e.target.value };
                    setSettings({ ...settings, trustStrip: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm">
                    {TRUST_ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Benefits */}
        {activeTab === "benefits" && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-brand-text-muted">The 4 benefit strip cards (Free Shipping, 100% Natural, etc.).</p>
            {settings.benefits.map((item, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-brand-bg/30 rounded-xl border border-[#E8E6E1]">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Label</label>
                  <input value={item.label} onChange={e => {
                    const arr = [...settings.benefits];
                    arr[i] = { ...arr[i], label: e.target.value };
                    setSettings({ ...settings, benefits: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Sub Text</label>
                  <input value={item.sub} onChange={e => {
                    const arr = [...settings.benefits];
                    arr[i] = { ...arr[i], sub: e.target.value };
                    setSettings({ ...settings, benefits: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Icon</label>
                  <select value={item.iconName} onChange={e => {
                    const arr = [...settings.benefits];
                    arr[i] = { ...arr[i], iconName: e.target.value };
                    setSettings({ ...settings, benefits: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm">
                    {LUCIDE_ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purposes */}
        {activeTab === "purposes" && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-brand-text-muted">The "Shop By Purpose" section cards.</p>
            {settings.purposes.map((item, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-brand-bg/30 rounded-xl border border-[#E8E6E1]">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Label</label>
                  <input value={item.label} onChange={e => {
                    const arr = [...settings.purposes];
                    arr[i] = { ...arr[i], label: e.target.value };
                    setSettings({ ...settings, purposes: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Link URL</label>
                  <input value={item.href} onChange={e => {
                    const arr = [...settings.purposes];
                    arr[i] = { ...arr[i], href: e.target.value };
                    setSettings({ ...settings, purposes: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" placeholder="/products?category=..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Icon</label>
                  <select value={item.iconName} onChange={e => {
                    const arr = [...settings.purposes];
                    arr[i] = { ...arr[i], iconName: e.target.value };
                    setSettings({ ...settings, purposes: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm">
                    {LUCIDE_ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Claims Marquee */}
        {activeTab === "claims" && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-brand-text-muted">The scrolling green banner claims. Each line is one claim.</p>
            {settings.qualityClaims.map((claim, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={claim} onChange={e => {
                  const arr = [...settings.qualityClaims];
                  arr[i] = e.target.value;
                  setSettings({ ...settings, qualityClaims: arr });
                }} className="flex-1 px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                <button onClick={() => {
                  const arr = settings.qualityClaims.filter((_, idx) => idx !== i);
                  setSettings({ ...settings, qualityClaims: arr });
                }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => setSettings({ ...settings, qualityClaims: [...settings.qualityClaims, "✔ New Claim"] })}
              className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline">
              <Plus className="w-4 h-4" /> Add Claim
            </button>
          </div>
        )}

        {/* Why PJ Bite */}
        {activeTab === "why" && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-brand-text-muted">The dark green "Why PJ Bite is Different" section (up to 3 points).</p>
            {settings.whyPjBite.map((item, i) => (
              <div key={i} className="p-4 bg-brand-bg/30 rounded-xl border border-[#E8E6E1] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">Title</label>
                    <input value={item.title} onChange={e => {
                      const arr = [...settings.whyPjBite];
                      arr[i] = { ...arr[i], title: e.target.value };
                      setSettings({ ...settings, whyPjBite: arr });
                    }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">Icon</label>
                    <select value={item.iconName} onChange={e => {
                      const arr = [...settings.whyPjBite];
                      arr[i] = { ...arr[i], iconName: e.target.value };
                      setSettings({ ...settings, whyPjBite: arr });
                    }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm">
                      {LUCIDE_ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Description</label>
                  <textarea rows={2} value={item.desc} onChange={e => {
                    const arr = [...settings.whyPjBite];
                    arr[i] = { ...arr[i], desc: e.target.value };
                    setSettings({ ...settings, whyPjBite: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm resize-none" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How It Works */}
        {activeTab === "how" && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-brand-text-muted">The "From Farm to Your Doorstep" 4-step process.</p>
            {settings.howItWorks.map((item, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-brand-bg/30 rounded-xl border border-[#E8E6E1]">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Step</label>
                  <input value={item.step} onChange={e => {
                    const arr = [...settings.howItWorks];
                    arr[i] = { ...arr[i], step: e.target.value };
                    setSettings({ ...settings, howItWorks: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" placeholder="01" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Label</label>
                  <input value={item.label} onChange={e => {
                    const arr = [...settings.howItWorks];
                    arr[i] = { ...arr[i], label: e.target.value };
                    setSettings({ ...settings, howItWorks: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Description</label>
                  <input value={item.desc} onChange={e => {
                    const arr = [...settings.howItWorks];
                    arr[i] = { ...arr[i], desc: e.target.value };
                    setSettings({ ...settings, howItWorks: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Icon</label>
                  <select value={item.iconName} onChange={e => {
                    const arr = [...settings.howItWorks];
                    arr[i] = { ...arr[i], iconName: e.target.value };
                    setSettings({ ...settings, howItWorks: arr });
                  }} className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg text-sm">
                    {LUCIDE_ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Order */}
        {activeTab === "bulk" && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-brand-text-muted">The "Big Savings on Bulk Orders" banner section.</p>
            <div>
              <label className="block text-sm font-bold text-brand-text mb-1">Badge Text</label>
              <input value={settings.bulkOrder.badge} onChange={e => setSettings({ ...settings, bulkOrder: { ...settings.bulkOrder, badge: e.target.value } })}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="e.g. Corporate & Wholesale" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-text mb-1">Title</label>
              <input value={settings.bulkOrder.title} onChange={e => setSettings({ ...settings, bulkOrder: { ...settings.bulkOrder, title: e.target.value } })}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="e.g. Big Savings on Bulk Orders! 🥜" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-text mb-1">Subtitle</label>
              <textarea rows={3} value={settings.bulkOrder.subtitle} onChange={e => setSettings({ ...settings, bulkOrder: { ...settings.bulkOrder, subtitle: e.target.value } })}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                placeholder="Short description..." />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark disabled:opacity-70 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Changes
        </button>
      </div>
    </div>
  );
}
