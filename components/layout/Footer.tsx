import Link from "next/link";
import { Instagram, Mail, Phone, MapPin, ArrowRight, ShieldCheck, Truck, CreditCard, Leaf, Linkedin, AtSign } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-[#1a3a20] text-white pt-16 pb-24 lg:pb-8 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a3c96e]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Newsletter Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-black font-serif mb-2">Join the PJ Bite Family</h2>
            <p className="text-xs text-white/70 font-medium leading-relaxed">
              Subscribe to our newsletter for exclusive offers, new arrivals, and the latest health tips. <span className="text-[#a3c96e] font-bold">Get 10% off your first order!</span>
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Main Links Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pt-12 pb-16">

          {/* Brand Col */}
          <div className="col-span-1 lg:col-span-4 pr-0 lg:pr-8">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-black tracking-tight font-serif text-white">
                Pj Bite
              </span>
            </Link>
            <p className="text-sm font-medium text-white/70 leading-relaxed mb-8 max-w-sm italic">
              "Every bite carries the essence of real farming"
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-[#a3c96e]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">100% Natural Processing</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.15em] mb-6">Shop Features</h3>
            <ul className="space-y-4 text-sm font-medium text-white/60">
              <li><Link href="/products?category=dried-fruits" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Dried Fruits</Link></li>
              <li><Link href="/products?category=dried-vegetables" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Dried Vegetables</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.15em] mb-6">Support & Info</h3>
            <ul className="space-y-4 text-sm font-medium text-white/60">
              <li><Link href="/about" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
              <li><Link href="/blogs" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Health Blogs</Link></li>
              <li><Link href="/shipping" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Shipping Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Privacy Policy</Link></li>
              <li><Link href="/refunds" className="hover:text-[#a3c96e] hover:translate-x-1 transition-all inline-block">Refunds & Returns</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.15em] mb-6">Get In Touch</h3>
            <ul className="space-y-4 text-sm font-medium text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#a3c96e] shrink-0 mt-0.5" />
                <span className="leading-snug">At Post Gaul Taluka Deoli,<br />Dist Wardha, Maharashtra, India 442101</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer w-fit">
                <Phone className="w-5 h-5 text-[#a3c96e] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">+91 7744929395</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer w-fit">
                <Mail className="w-5 h-5 text-[#a3c96e] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">infopjbite@gmail.com</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="mt-8 flex gap-3">
              <a href="https://www.instagram.com/pjbite?igsh=Ym5iZml2bjVobjc0&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#a3c96e] hover:border-[#a3c96e] hover:text-[#1a3a20] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/share/18BNpiAo5V/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#a3c96e] hover:border-[#a3c96e] hover:text-[#1a3a20] transition-all font-serif font-bold text-sm">
                f
              </a>
              <a href="https://www.linkedin.com/in/pj-bite-833b653b8" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#a3c96e] hover:border-[#a3c96e] hover:text-[#1a3a20] transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/pj-bite-833b653b8" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#a3c96e] hover:border-[#a3c96e] hover:text-[#1a3a20] transition-all">
                <AtSign className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <p>© {new Date().getFullYear()} PJ Bite. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Secure Checkout</span>
            <span>•</span>
            <div className="flex gap-2 text-white/60">
              <span className="bg-white/10 px-2 py-0.5 rounded">UPI</span>
              <span className="bg-white/10 px-2 py-0.5 rounded">VISA</span>
              <span className="bg-white/10 px-2 py-0.5 rounded">RUPAY</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
