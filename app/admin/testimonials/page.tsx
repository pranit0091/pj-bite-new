"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Loader2, Star } from "lucide-react";
import { showToast, showConfirm, showError } from "@/lib/swal";

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  detail: string;
  text: string;
  rating: number;
  active: boolean;
  order: number;
}

const EMPTY_FORM = { name: "", location: "", detail: "", text: "", rating: 5, active: true, order: 0 };

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)}>
          <Star className={`w-5 h-5 ${i <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

function FormFields({ f, setF }: { f: typeof EMPTY_FORM; setF: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Name *</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g. Priya S." />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Location</label>
          <input value={f.location} onChange={e => setF({ ...f, location: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g. Mumbai" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-text mb-1">Detail Line <span className="font-normal text-brand-text-muted">(e.g. "Mumbai · Almonds Premium")</span></label>
        <input value={f.detail} onChange={e => setF({ ...f, detail: e.target.value })}
          className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="Mumbai · Almonds Premium" />
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-text mb-1">Review Text *</label>
        <textarea rows={4} value={f.text} onChange={e => setF({ ...f, text: e.target.value })}
          className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          placeholder="Write the customer review..." />
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-2">Rating</label>
          <StarRating value={f.rating} onChange={v => setF({ ...f, rating: v })} />
        </div>
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

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/testimonials?admin=1");
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
    } catch {
      showError("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      showToast("Name and review text are required", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Testimonial created", "success");
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
      const res = await fetch(`/api/testimonials/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Testimonial updated", "success");
      setEditing(null);
      fetchItems();
    } catch (err: any) {
      showError("Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm("Delete Testimonial?", "This cannot be undone.");
    if (!ok) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    showToast("Deleted", "success");
    fetchItems();
  };

  const handleToggle = async (item: Testimonial) => {
    await fetch(`/api/testimonials/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    fetchItems();
  };

  const openEdit = (item: Testimonial) => {
    setEditing(item);
    setEditForm({ name: item.name, location: item.location, detail: item.detail, text: item.text, rating: item.rating, active: item.active, order: item.order });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-text font-serif tracking-tight">Testimonials</h1>
          <p className="text-brand-text-muted mt-1 font-medium">Manage customer reviews shown on the home page.</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-brand-text">New Testimonial</h2>
            <button onClick={() => setIsCreating(false)}><X className="w-5 h-5 text-brand-text-muted" /></button>
          </div>
          <FormFields f={form} setF={setForm} />
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
          <div className="p-12 text-center text-brand-text-muted">No testimonials yet.</div>
        ) : (
          <ul className="divide-y divide-[#E8E6E1]">
            {items.map(item => (
              <li key={item._id} className="p-5 hover:bg-brand-bg/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-black text-brand-text text-sm">{item.name}</span>
                      {item.location && <span className="text-xs text-brand-text-muted">{item.location}</span>}
                      {!item.active && <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Inactive</span>}
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= item.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
                      </div>
                    </div>
                    {item.detail && <p className="text-xs text-brand-primary font-bold mb-1">{item.detail}</p>}
                    <p className="text-sm text-brand-text-muted leading-relaxed line-clamp-2">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleToggle(item)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${item.active ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
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
              <h2 className="text-xl font-bold text-brand-text">Edit Testimonial</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-brand-text-muted" /></button>
            </div>
            <FormFields f={editForm} setF={setEditForm} />
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
