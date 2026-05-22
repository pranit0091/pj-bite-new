"use client";

import { MapPin, Phone, Mail, Instagram, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    // Simulate API call
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <div className="bg-brand-bg min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-[11px] font-bold text-brand-primary uppercase tracking-[0.45em] mb-5">
            Support Line
          </p>
          <h1 className="font-serif font-black text-brand-text mb-5 tracking-tight leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)", letterSpacing: "-0.025em" }}>
            Get in <span className="text-brand-primary">Touch</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-text-muted max-w-xl mx-auto font-medium leading-relaxed">
            Have a question about our premium ingredients, or interested in bulk orders?
            We&apos;d love to hear from you — drop us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-stretch">
          
          {/* Contact Info Panel */}
          <div className="lg:col-span-2 bg-brand-bg rounded-[2.5rem] p-10 h-full flex flex-col justify-between premium-shadow border border-[#E8E6E1] relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-xl font-black text-brand-text mb-8 tracking-tight font-serif">Contact Information</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-brand-primary border border-[#E8E6E1] group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-[15px] mb-0.5">Our Location</h3>
                    <p className="text-[13px] text-brand-text-muted leading-relaxed font-medium">At Post Gaul, Taluka Deoli,<br/>District Wardha, Maharashtra, India 442101</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-brand-primary border border-[#E8E6E1] group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-[15px] mb-0.5">Phone Number</h3>
                    <p className="text-[13px] text-brand-text-muted leading-relaxed font-medium">+91 7744929395</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-brand-primary border border-[#E8E6E1] group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-[15px] mb-0.5">Email Address</h3>
                    <p className="text-[13px] text-brand-text-muted leading-relaxed font-medium">infopjbite@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-[#E8E6E1]/50 relative z-10">
              <h3 className="font-black text-brand-text text-[11px] mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
                 Follow Us <span className="h-px bg-[#E8E6E1] flex-1"></span>
              </h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-text-muted hover:text-white hover:bg-[#E1306C] transition-colors duration-300 shadow-sm border border-[#E8E6E1] hover:border-[#E1306C]">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 sm:p-12 h-full premium-shadow border border-[#E8E6E1]">
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-6 border border-brand-primary/20">
                  <Send className="w-8 h-8 ml-1" />
                </div>
                <h3 className="text-3xl font-black text-brand-text mb-4 tracking-tight font-serif">Message Sent!</h3>
                <p className="text-brand-text-muted text-lg max-w-sm mx-auto mb-10 font-medium">
                  Thank you for reaching out to PJ Bite. We'll get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="bg-brand-bg text-brand-text px-8 py-3 rounded-full font-bold text-sm hover:bg-brand-primary hover:text-white transition-colors duration-300 uppercase tracking-widest border border-[#E8E6E1]"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-2.5">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      required
                      className="w-full px-5 py-4 text-[14px] rounded-xl border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-brand-bg/50 focus:bg-white font-medium placeholder:text-brand-text-muted/50"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-2.5">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      required
                      className="w-full px-5 py-4 text-[14px] rounded-xl border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-brand-bg/50 focus:bg-white font-medium placeholder:text-brand-text-muted/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-2.5">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    className="w-full px-5 py-4 text-[14px] rounded-xl border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-brand-bg/50 focus:bg-white font-medium placeholder:text-brand-text-muted/50"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="message" className="block text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-2.5">Your Message</label>
                  <textarea 
                    id="message" 
                    required
                    rows={6}
                    className="w-full h-[calc(100%-2rem)] min-h-[160px] px-5 py-4 text-[14px] rounded-xl border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-brand-bg/50 focus:bg-white resize-none font-medium placeholder:text-brand-text-muted/50"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === "submitting"}
                  className="w-full bg-brand-primary hover:bg-[#164a20] text-white font-black text-[12px] py-4.5 rounded-xl premium-shadow shadow-brand-primary/20 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-wait mt-auto uppercase tracking-[0.2em] group"
                >
                  {status === "submitting" ? "Sending Message..." : "Send Message"}
                  {status === "idle" && <Send className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
