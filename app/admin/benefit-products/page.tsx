"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Loader2, CheckCircle } from "lucide-react";
import { showToast, showConfirm, showError } from "@/lib/swal";

interface BenefitProduct {
  _id: string;
  name: string;
  tagline: string;
  benefits: string[];
  desc: string;
  bgColor: string;
  iconType: string;
  order: number;
  active: boolean;
}

const BG_COLORS = [
  { value: "bg-amber-50", label: "Amber" },
  { value: "bg-orange-50", label: "Orange" },
  { value: "bg-green-50", label: "Green" },
  { value: "bg-emerald-50", label: "Emerald" },
  { value: "bg-yellow-50", label: "Yellow" },
  { value: "bg-red-50", label: "Red" },
  { value: "bg-pink-50", label: "Pink" },
  { value: "bg-stone-50", label: "Stone" },
];

const ICON_TYPES = [
  "mango", "avocado", "pineapple", "guava", "strawberry",
  "sapota", "banana", "mixed", "kiwi", "papaya", "jackfruit",
  "orange", "dragonfruit",
];

const EMPTY_FORM = {
  name: "", tagline: "", benefits: ["", "", ""], desc: "",
  bgColor: "bg-amber-50", iconType: "mango", order: 0, active: true,
};

function ItemForm({ f, setF }: { f: typeof EMPTY_FORM; setF: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Product Name *</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g. Dried Mango" />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Tagline</label>
          <input value={f.tagline} onChange={e => setF({ ...f, tagline: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g. Tropical Sweetness. Naturally Preserved." />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-text mb-1">Health Benefits <span className="font-normal text-brand-text-muted">(up to 3)</span></label>
        <div className="space-y-2">
          {f.benefits.map((b, i) => (
            <input key={i} value={b} onChange={e => { const nb = [...f.benefits]; nb[i] = e.target.value; setF({ ...f, benefits: nb }); }}
              className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder={`Benefit ${i + 1}, e.g. Rich in Vitamin A`} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-text mb-1">Description</label>
        <textarea rows={3} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })}
          className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          placeholder="Short nutritional description..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Icon Type</label>
          <select value={f.iconType} onChange={e => setF({ ...f, iconType: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary capitalize">
            {ICON_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Background Color</label>
          <select value={f.bgColor} onChange={e => setF({ ...f, bgColor: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
            {BG_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Order</label>
          <input type="number" min={0} value={f.order} onChange={e => setF({ ...f, order: parseInt(e.target.value) || 0 })}
            className="w-20 px-3 py-2 border border-[#E8E6E1] rounded-xl text-sm" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-5">
          <input type="checkbox" checked={f.active} onChange={e => setF({ ...f, active: e.target.checked })} className="w-4 h-4 accent-brand-primary" />
          <span className="text-sm font-bold text-brand-text">Active</span>
        </label>
      </div>
    </div>
  );
}

export default function AdminBenefitProductsPage() {
  const [items, setItems] = useState<BenefitProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<BenefitProduct | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/benefit-products?admin=1");
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
    } catch {
      showError("Failed to load benefit products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const preparePayload = (f: typeof EMPTY_FORM) => ({
    ...f,
    benefits: f.benefits.filter(b => b.trim()),
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showToast("Name is required", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/benefit-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparePayload(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Benefit product created", "success");
      setIsCreating(false);
      setForm(EMPTY_FORM);
      fetchItems();
    } catch (err: any) {
      showError("Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/benefit-products/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparePayload(editForm)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Updated", "success");
      setEditing(null);
      fetchItems();
    } catch (err: any) {
      showError("Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm("Delete this item?", "This cannot be undone.");
    if (!ok) return;
    await fetch(`/api/benefit-products/${id}`, { method: "DELETE" });
    showToast("Deleted", "success");
    fetchItems();
  };

  const handleToggle = async (item: BenefitProduct) => {
    await fetch(`/api/benefit-products/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    fetchItems();
  };

  const openEdit = (item: BenefitProduct) => {
    setEditing(item);
    const benefits = [...item.benefits];
    while (benefits.length < 3) benefits.push("");
    setEditForm({ name: item.name, tagline: item.tagline, benefits, desc: item.desc, bgColor: item.bgColor, iconType: item.iconType, order: item.order, active: item.active });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-text font-serif tracking-tight">Benefit Products</h1>
          <p className="text-brand-text-muted mt-1 font-medium">Manage the scrolling "Nature's Pick: Health Benefits" carousel.</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-brand-text">New Benefit Product</h2>
            <button onClick={() => setIsCreating(false)}><X className="w-5 h-5 text-brand-text-muted" /></button>
          </div>
          <ItemForm f={form} setF={setForm} />
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E8E6E1]">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-bold text-brand-text-muted hover:text-brand-text">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary-dark disabled:opacity-70 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted">No benefit products yet.</div>
        ) : (
          <ul className="divide-y divide-[#E8E6E1]">
            {items.map(item => (
              <li key={item._id} className="p-5 hover:bg-brand-bg/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl ${item.bgColor} flex items-center justify-center shrink-0 text-lg font-black text-brand-primary/40`}>
                      {item.iconType.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-black text-brand-text text-sm">{item.name}</p>
                        {!item.active && <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Inactive</span>}
                      </div>
                      {item.tagline && <p className="text-xs text-brand-primary italic mb-1">"{item.tagline}"</p>}
                      <div className="flex flex-wrap gap-1">
                        {item.benefits.map((b, i) => (
                          <span key={i} className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleToggle(item)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${item.active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                      {item.active ? "Live" : "Off"}
                    </button>
                    <button onClick={() => openEdit(item)} className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-green-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-brand-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-brand-text">Edit Benefit Product</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-brand-text-muted" /></button>
            </div>
            <ItemForm f={editForm} setF={setEditForm} />
            <div className="flex gap-3 pt-4 mt-4 border-t border-[#E8E6E1]">
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-3 border border-[#E8E6E1] text-brand-text-muted font-bold rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-primary-dark disabled:opacity-70 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
