"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function CareersForm({ roles }: { roles: string[] }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: roles[0] ?? "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Submission failed.");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white border border-[#E8E6E1] rounded-[2rem] p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-brand-primary" />
        </div>
        <h3 className="text-2xl font-black text-brand-text font-serif mb-3">Application Received!</h3>
        <p className="text-brand-text-muted font-medium leading-relaxed max-w-md mx-auto">
          Thank you for your interest in joining PJ Bite. Our team will review your application and reach out within 3–5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E8E6E1] rounded-[2rem] p-8 sm:p-10 shadow-sm space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Full Name *</label>
          <input
            type="text" name="name" required
            value={form.name} onChange={handleChange}
            placeholder="Your full name"
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text placeholder:text-brand-text-muted/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Email Address *</label>
          <input
            type="email" name="email" required
            value={form.email} onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text placeholder:text-brand-text-muted/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Phone Number</label>
          <input
            type="tel" name="phone"
            value={form.phone} onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text placeholder:text-brand-text-muted/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Position Applying For *</label>
          <select
            name="position" required
            value={form.position} onChange={handleChange}
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all appearance-none cursor-pointer"
          >
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            <option value="General Application">General Application</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Cover Letter / Message</label>
        <textarea
          name="message" rows={5}
          value={form.message} onChange={handleChange}
          placeholder="Tell us about yourself, your experience, and why you'd be a great fit at PJ Bite…"
          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E6E1] rounded-xl text-sm font-bold text-brand-text placeholder:text-brand-text-muted/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        type="submit" disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-3 bg-brand-primary hover:bg-[#164a20] text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 uppercase tracking-widest text-xs"
      >
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>Submit Application <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <p className="text-center text-[10px] text-brand-text-muted font-medium">
        By submitting, you agree that we may store your details to contact you about this application.
      </p>
    </form>
  );
}
