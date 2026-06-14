"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Subscription failed");
      setStatus("success");
      setMessage("You're in — watch your inbox for your 10% off code.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Subscription failed");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full md:w-auto flex items-center gap-3 bg-[#a3c96e]/15 border border-[#a3c96e]/40 rounded-full px-5 py-3.5 text-[#a3c96e]">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-xs font-bold">{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 sm:w-80">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setMessage(""); }}
          placeholder="Enter your email address"
          className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#a3c96e] transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[#a3c96e] hover:bg-[#8eb85a] disabled:opacity-60 disabled:cursor-wait text-[#1a3a20] px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
      </button>
      {status === "error" && (
        <p className="text-xs font-bold text-red-300 sm:absolute sm:-bottom-6 sm:left-0">{message}</p>
      )}
    </form>
  );
}
