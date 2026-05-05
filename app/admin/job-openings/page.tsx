"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Loader2, MapPin, Clock } from "lucide-react";
import { showToast, showConfirm, showError } from "@/lib/swal";

interface JobOpening {
  _id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  tags: string[];
  active: boolean;
  order: number;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const EMPTY_FORM = {
  title: "",
  type: "Full-time",
  location: "",
  description: "",
  tags: "",
  active: true,
  order: 0,
};

type FormState = typeof EMPTY_FORM;

export default function AdminJobOpeningsPage() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<JobOpening | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/job-openings?all=true");
      const data = await res.json();
      if (res.ok) setJobs(data.data || []);
    } catch {
      showError("Failed to load job openings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const tagsToArray = (tags: string) =>
    tags.split(",").map(t => t.trim()).filter(Boolean);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      showToast("Title, location, and description are required", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/job-openings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: tagsToArray(form.tags) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Job opening created", "success");
      setIsCreating(false);
      setForm(EMPTY_FORM);
      fetchJobs();
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
      const res = await fetch(`/api/job-openings/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, tags: tagsToArray(editForm.tags) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Job opening updated", "success");
      setEditing(null);
      fetchJobs();
    } catch (err: any) {
      showError("Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm("Delete job opening?", "This cannot be undone.");
    if (!ok) return;
    try {
      await fetch(`/api/job-openings/${id}`, { method: "DELETE" });
      showToast("Job opening deleted", "success");
      fetchJobs();
    } catch {
      showError("Failed to delete job opening");
    }
  };

  const handleToggle = async (job: JobOpening) => {
    try {
      await fetch(`/api/job-openings/${job._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !job.active }),
      });
      fetchJobs();
    } catch {
      showError("Failed to update");
    }
  };

  const openEdit = (job: JobOpening) => {
    setEditing(job);
    setEditForm({
      title: job.title,
      type: job.type,
      location: job.location,
      description: job.description,
      tags: job.tags.join(", "),
      active: job.active,
      order: job.order,
    });
  };

  const FormFields = ({ f, setF }: { f: FormState; setF: (v: FormState) => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Job Title *</label>
          <input
            value={f.title}
            onChange={e => setF({ ...f, title: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g. Field Sourcing Executive"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Job Type *</label>
          <select
            value={f.type}
            onChange={e => setF({ ...f, type: e.target.value })}
            className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-text mb-1">Location *</label>
        <input
          value={f.location}
          onChange={e => setF({ ...f, location: e.target.value })}
          className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="e.g. Nagpur, Maharashtra or Remote"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-text mb-1">Description *</label>
        <textarea
          rows={3}
          value={f.description}
          onChange={e => setF({ ...f, description: e.target.value })}
          className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          placeholder="Describe the role responsibilities..."
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-text mb-1">Tags <span className="font-normal text-brand-text-muted">(comma-separated)</span></label>
        <input
          value={f.tags}
          onChange={e => setF({ ...f, tags: e.target.value })}
          className="w-full px-4 py-2 border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="e.g. SEO, Social Media, Content"
        />
      </div>
      <div className="flex items-center gap-6">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-1">Display Order</label>
          <input
            type="number"
            min={0}
            value={f.order}
            onChange={e => setF({ ...f, order: parseInt(e.target.value) || 0 })}
            className="w-24 px-3 py-2 border border-[#E8E6E1] rounded-xl text-sm"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-5">
          <input
            type="checkbox"
            checked={f.active}
            onChange={e => setF({ ...f, active: e.target.checked })}
            className="w-4 h-4 accent-brand-primary"
          />
          <span className="text-sm font-bold text-brand-text">Active (visible on site)</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-text font-serif tracking-tight">Job Openings</h1>
          <p className="text-brand-text-muted mt-1 font-medium">Manage job listings shown on the Careers page.</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Opening
          </button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-brand-text">New Job Opening</h2>
            <button onClick={() => { setIsCreating(false); setForm(EMPTY_FORM); }}>
              <X className="w-5 h-5 text-brand-text-muted" />
            </button>
          </div>
          <FormFields f={form} setF={setForm} />
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E8E6E1]">
            <button onClick={() => { setIsCreating(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm font-bold text-brand-text-muted hover:text-brand-text">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary-dark disabled:opacity-70 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Opening
            </button>
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted">No job openings yet. Add your first one above.</div>
        ) : (
          <ul className="divide-y divide-[#E8E6E1]">
            {jobs.map((job) => (
              <li key={job._id} className="p-5 hover:bg-brand-bg/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-brand-text text-sm">{job.title}</span>
                      {!job.active && (
                        <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Inactive</span>
                      )}
                      {job.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-brand-primary bg-brand-primary/8 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-brand-text-muted leading-relaxed line-clamp-2 mb-2">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-brand-text-muted">
                        <Clock className="w-3.5 h-3.5" /> {job.type}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-brand-text-muted">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggle(job)}
                      title={job.active ? "Deactivate" : "Activate"}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${job.active ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                    >
                      {job.active ? "Live" : "Off"}
                    </button>
                    <button onClick={() => openEdit(job)} className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-green-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(job._id)} className="p-2 text-brand-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-brand-text">Edit Job Opening</h2>
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
