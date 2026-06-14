"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Loader2 } from "lucide-react";
import { showToast, showConfirm, showError } from "@/lib/swal";
import ImageUpload from "@/components/ui/ImageUpload";
import FileUpload from "@/components/ui/FileUpload";

interface QualityCard {
  _id: string;
  title: string;
  desc: string;
  img: string;
  alt: string;
  order: number;
  active: boolean;
  reportUrl: string;
}

const EMPTY_FORM = { title: "", desc: "", img: "", alt: "", order: 0, active: true, reportUrl: "" };

function CardForm({ f, setF }: { f: typeof EMPTY_FORM; setF: (v: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1.5">Card Image *</label>
          <ImageUpload folder="quality-cards" defaultImage={f.img} onUpload={url => url && setF({ ...f, img: url })} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Title *</label>
          <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g. In-House R&D Experts" />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Description</label>
          <textarea rows={3} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            placeholder="Short description shown below the title..." />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Alt Text</label>
          <input value={f.alt} onChange={e => setF({ ...f, alt: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Image description for accessibility" />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Test Report (PDF)</label>
          <FileUpload
            folder="quality-reports"
            defaultUrl={f.reportUrl}
            onUpload={(url) => setF({ ...f, reportUrl: url })}
            label="Upload test report PDF"
          />
          <p className="text-[11px] text-brand-text-muted mt-2">
            Or paste an external URL:
          </p>
          <input
            value={f.reportUrl}
            onChange={(e) => setF({ ...f, reportUrl: e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="https://… link to lab/quality report"
          />
          <p className="text-[11px] text-brand-text-muted mt-1">Optional. When set, visitors can click the card to view the report as proof.</p>
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
    </div>
  );
}

export default function AdminQualityCardsPage() {
  const [items, setItems] = useState<QualityCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<QualityCard | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quality-cards?admin=1");
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
    } catch {
      showError("Failed to load quality cards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.img.trim()) {
      showToast("Title and image are required", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quality-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Card created", "success");
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
      const res = await fetch(`/api/quality-cards/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Card updated", "success");
      setEditing(null);
      fetchItems();
    } catch (err: any) {
      showError("Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm("Delete Quality Card?", "This cannot be undone.");
    if (!ok) return;
    await fetch(`/api/quality-cards/${id}`, { method: "DELETE" });
    showToast("Deleted", "success");
    fetchItems();
  };

  const handleToggle = async (item: QualityCard) => {
    await fetch(`/api/quality-cards/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    fetchItems();
  };

  const openEdit = (item: QualityCard) => {
    setEditing(item);
    setEditForm({ title: item.title, desc: item.desc, img: item.img, alt: item.alt, order: item.order, active: item.active, reportUrl: item.reportUrl || "" });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-text font-serif tracking-tight">Quality Cards</h1>
          <p className="text-brand-text-muted mt-1 font-medium">Manage the "Only Perfect Makes The Cut" trust section (4 cards).</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Card
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-brand-text">New Quality Card</h2>
            <button onClick={() => setIsCreating(false)}><X className="w-5 h-5 text-brand-text-muted" /></button>
          </div>
          <CardForm f={form} setF={setForm} />
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E8E6E1]">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-bold text-brand-text-muted hover:text-brand-text">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary-dark disabled:opacity-70 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Card
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-4 p-12 flex justify-center bg-white rounded-2xl border border-[#E8E6E1]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-4 p-12 text-center text-brand-text-muted bg-white rounded-2xl border border-[#E8E6E1]">
            No quality cards yet. Add your first one above.
          </div>
        ) : items.map(item => (
          <div key={item._id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${item.active ? "border-[#E8E6E1]" : "border-gray-200 opacity-60"}`}>
            <div className="relative aspect-video bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.img} alt={item.alt || item.title} className="w-full h-full object-cover" />
              {!item.active && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-xs font-black bg-gray-800 text-white px-3 py-1 rounded-full uppercase">Inactive</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="font-black text-brand-text text-sm mb-1 line-clamp-1">{item.title}</p>
              <p className="text-xs text-brand-text-muted line-clamp-2 mb-3">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-text-muted">Order: {item.order}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleToggle(item)} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${item.active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                    {item.active ? "Live" : "Off"}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 text-brand-text-muted hover:text-brand-primary hover:bg-green-50 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-1.5 text-brand-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-brand-text">Edit Quality Card</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-brand-text-muted" /></button>
            </div>
            <CardForm f={editForm} setF={setEditForm} />
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
