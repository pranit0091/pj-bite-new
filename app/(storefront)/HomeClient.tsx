"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Truck, Shield, Award, Plus, Minus, Sun, CheckCircle,
  ChevronRight, ChevronLeft, ArrowRight, Sparkles, Gift, Sprout,
  Utensils, Dumbbell, Star, Package,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import WishlistButton from "@/components/ui/WishlistButton";
import { showSuccess, showToast } from "@/lib/swal";

// ── Icon resolver (maps string name → Lucide component) ────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Truck, Shield, Leaf, Award, Gift, Sprout, Utensils, Dumbbell,
  Sun, CheckCircle, Sparkles, Star, Package,
};
function DynIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Leaf;
  return <Icon className={className} />;
}

// ── Trust-strip SVG presets (keyed by iconType) ───────────────────────────
const TRUST_SVGS: Record<string, React.ReactNode> = {
  "no-color": (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
      <path d="M12 2L15 8H9L12 2Z" fill="#22C55E" stroke="none" />
      <circle cx="12" cy="14" r="8" stroke="#1a3a20" />
      <path d="M12 10V18" stroke="#D4A017" />
      <path d="M8 14H16" stroke="#D4A017" />
    </svg>
  ),
  "no-sugar": (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
      <path d="M20 7L12 3L4 7V17L12 21L20 17V7Z" stroke="#1a3a20" />
      <path d="M12 8L12 16M8 12L16 12" stroke="#22C55E" />
    </svg>
  ),
  "no-chemical": (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
      <path d="M10 2L8 8H16L14 2H10Z" fill="#1a3a20" stroke="none" />
      <path d="M8 8C5 8 4 12 4 15C4 19 8 22 12 22C16 22 20 19 20 15C20 12 19 8 16 8" stroke="#1a3a20" />
      <circle cx="12" cy="15" r="3" fill="#22C55E" stroke="none" />
    </svg>
  ),
  "no-flavor": (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#1a3a20" />
      <path d="M7 12L10 15L17 8" stroke="#22C55E" />
    </svg>
  ),
};

// ── Benefit-product SVG presets (keyed by iconType) ───────────────────────
const BENEFIT_SVGS: Record<string, React.ReactNode> = {
  mango: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.path animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        d="M20 32C12 32 10 22 14 15C16.5 9.5 20 8 20 8C20 8 23.5 9.5 26 15C30 22 28 32 20 32Z" fill="#FFF3CC" stroke="#D4A017" strokeWidth="1.7" />
      <motion.path animate={{ rotate: [-15, 15, -15], originX: "20px", originY: "8px" }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        d="M20 8C18 5 15 4.5 15 7C15 8 17 8.5 20 8Z" fill="#3B7A3B" stroke="none" />
    </svg>
  ),
  avocado: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.path animate={{ scaleY: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        d="M20 33C13 33 11 25 13 18C15 12 18 9 20 9C22 9 25 12 27 18C29 25 27 33 20 33Z" fill="#C8F7C5" stroke="#22C55E" strokeWidth="1.7" />
      <motion.ellipse animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="26" rx="4.5" ry="5.5" fill="#8B5E3C" stroke="#5C3317" strokeWidth="1.3" />
    </svg>
  ),
  pineapple: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.ellipse animate={{ x: [-1, 1, -1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="24" rx="9" ry="10" fill="#FFF3CC" stroke="#D4A017" strokeWidth="1.7" />
      <motion.path animate={{ rotate: [-15, 15, -15], originX: "20px", originY: "14px" }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        d="M20 14 C20 8 20 6 20 4" stroke="#3B7A3B" strokeWidth="1.7" fill="none" />
    </svg>
  ),
  guava: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.circle animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="21" r="11" fill="#E8FFE4" stroke="#22C55E" strokeWidth="1.7" />
      <motion.circle animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="21" r="3" fill="#FFEECC" stroke="#D4A017" strokeWidth="1.3" />
    </svg>
  ),
  strawberry: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.path animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        d="M20 33C14 33 11 23 13 16C13 16 16 18 20 18C24 18 27 16 27 16C29 23 26 33 20 33Z" fill="#FFD3D3" stroke="#EF4444" strokeWidth="1.7" />
      <motion.path animate={{ rotate: [-10, 10, -10], originX: "20px", originY: "18px" }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        d="M20 18C20 14 18 11 20 11C22 11 20 14 20 18Z" stroke="#22C55E" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  sapota: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.ellipse animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="22" rx="10" ry="11" fill="#DEB887" stroke="#8B5E3C" strokeWidth="1.7" />
    </svg>
  ),
  banana: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.path animate={{ scaleX: [1, 1.05, 1], rotate: [-3, 3, -3] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        d="M8 26C8 20 12 12 20 11C28 10 33 16 32 22C32 26 28 30 20 30C14 30 8 30 8 26Z" fill="#FFF3CC" stroke="#D4A017" strokeWidth="1.7" />
    </svg>
  ),
  kiwi: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.ellipse animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        cx="20" cy="21" rx="12" ry="12" fill="#C8F7C5" stroke="#22C55E" strokeWidth="1.7" />
      <motion.ellipse animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="21" rx="4" ry="4" fill="#FFF3CC" stroke="#D4A017" strokeWidth="1.3" />
    </svg>
  ),
  papaya: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.path animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        d="M20 34C14 34 11 25 12 18C13 13 16 9 20 9C24 9 27 13 28 18C29 25 26 34 20 34Z" fill="#FFD38C" stroke="#F59E0B" strokeWidth="1.7" />
      <motion.ellipse animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="25" rx="3.5" ry="4.5" fill="#1a3a20" stroke="#0f2014" strokeWidth="1" />
    </svg>
  ),
  jackfruit: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.path animate={{ skewX: [-2, 2, -2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        d="M12 14C12 14 10 20 12 26C14 31 18 34 22 33C28 31 31 25 30 19C29 14 25 10 20 10C15 10 12 12 12 14Z" fill="#FFF3CC" stroke="#D4A017" strokeWidth="1.7" />
    </svg>
  ),
  orange: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.circle animate={{ rotate: [0, 360] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        cx="20" cy="21" r="12" fill="#FFE4CC" stroke="#F97316" strokeWidth="1.7" />
      <motion.path animate={{ rotate: [-20, 20, -20], originX: "20px", originY: "9px" }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        d="M20 9C21 7 22.5 6 22.5 6" stroke="#3B7A3B" strokeWidth="1.4" />
    </svg>
  ),
  dragonfruit: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.ellipse animate={{ scale: [1, 1.05, 1], rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="22" rx="11" ry="12" fill="#FFB3D9" stroke="#EC4899" strokeWidth="1.7" />
      <motion.ellipse animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        cx="20" cy="22" rx="7" ry="8" fill="#fff" stroke="#EC4899" strokeWidth="1" />
    </svg>
  ),
  mixed: (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.5">
      <motion.circle animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        cx="12" cy="24" r="5.5" fill="#FFF3CC" stroke="#D4A017" strokeWidth="1.6" />
      <motion.circle animate={{ scale: [1, 1.08, 1], x: [-1, 1, -1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        cx="22" cy="28" r="5" fill="#FFE4E4" stroke="#EF4444" strokeWidth="1.6" />
      <motion.circle animate={{ scale: [1, 1.06, 1], y: [-1, 1, -1] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        cx="30" cy="22" r="4.5" fill="#E8FFE4" stroke="#22C55E" strokeWidth="1.6" />
    </svg>
  ),
};

// ── Types ──────────────────────────────────────────────────────────────────
interface HomeSettingsData {
  trustStrip: Array<{ label: string; subline: string; iconType: string }>;
  benefits: Array<{ label: string; sub: string; iconName: string }>;
  purposes: Array<{ label: string; iconName: string; href: string }>;
  qualityClaims: string[];
  whyPjBite: Array<{ title: string; desc: string; iconName: string }>;
  howItWorks: Array<{ step: string; label: string; desc: string; iconName: string }>;
  bulkOrder: { badge: string; title: string; subtitle: string };
}

// ── ProductCard ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const { addItem, setBuyNowItem, openCheckout, openAuthModal } = useCartStore((state) => state);
  const { status } = useSession();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    addItem({
      id: product._id?.toString() || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || "",
      vendorId: product.vendorId?.toString() || "",
    });
    showSuccess("Added to Cart!", `${product.name} is now in your cart.`);
    setTimeout(() => setAdding(false), 800);
  };

  const handleBuyNow = () => {
    if (status !== "authenticated") {
      showToast("Sign in to buy now! 💚");
      openAuthModal();
      return;
    }
    setBuyNowItem({
      id: product._id?.toString() || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || "",
      vendorId: product.vendorId?.toString() || "",
      quantity: 1,
    });
    openCheckout();
  };

  const img = product.images?.[0] || product.image || "https://placehold.co/400x400/f5f0e8/8b7355?text=Dry+Fruit";
  const originalPrice = product.originalPrice || Math.round(product.price * 1.2);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const productId = product._id?.toString() || product.id || "";

  return (
    <div className="group bg-white rounded-[1.25rem] border border-gray-100 hover:border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-300 flex flex-col h-full relative">
      <div className="relative">
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 items-start">
          {discount > 0 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.tag && (
            <span className={`backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm flex items-center gap-1 ${product.tag === "New" ? "bg-[#1a3a20]" : "bg-brand-primary/90"}`}>
              {product.tag === "New" && <Sparkles className="w-2 h-2" />} {product.tag}
            </span>
          )}
        </div>
        {productId && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <WishlistButton productId={productId} product={product} size="sm" />
          </div>
        )}
        <Link href={`/products/${product.slug}`}>
          <div className="aspect-[4/3] bg-gradient-to-b from-[#fcfaf8] to-[#f5f2ec] relative overflow-hidden">
            <Image src={img} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform drop-shadow-sm" />
          </div>
        </Link>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">PJ BITE</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug hover:text-brand-primary transition-colors mb-2" title={product.name}>
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[9px] text-gray-500 font-bold ml-1">(12)</span>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5 text-gray-900">
            <span className="text-sm sm:text-base font-black">₹{product.price}</span>
            {discount > 0 && <span className="text-[10px] text-gray-500 line-through">₹{originalPrice}</span>}
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleAdd}
              className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest transition-all duration-200 shadow-sm border ${adding ? "bg-brand-accent text-white border-brand-accent" : "bg-white text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white"}`}>
              {adding ? "Added ✓" : "Add Cart"}
            </button>
            <button onClick={handleBuyNow}
              className="flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest bg-brand-primary text-white hover:bg-[#164a20] transition-all duration-200 shadow-sm">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── VerticalQualitySlider (MOBILE ONLY) ────────────────────────────────────
function VerticalQualitySlider({ cards }: { cards: any[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || cards.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, cards.length]);

  if (cards.length === 0) return null;
  const card = cards[currentIdx];

  return (
    <div className="relative min-h-[380px] sm:min-h-[440px] flex flex-col items-center"
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={currentIdx}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full bg-[#FAF4E8] rounded-2xl overflow-hidden flex flex-col items-center pt-8 px-5 shadow-md border border-[#EBE3D3]">
          <div className="text-center mb-5">
            <Sun className="w-6 h-6 text-[#E0D5B5] mx-auto mb-3" />
            <h3 className="text-[#1A3A20] text-[16px] font-black leading-tight mb-2 drop-shadow-sm">{card.title}</h3>
            <p className="text-[#4F5E48] text-[11px] font-bold leading-relaxed">{card.desc}</p>
          </div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[105%] mt-auto h-48 sm:h-56 relative -bottom-2 rounded-t-[20px] overflow-hidden drop-shadow-sm">
            <Image src={card.img} alt={card.alt || card.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover object-top" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2.5 mt-6">
        {cards.map((_, i) => (
          <button key={i} onClick={() => setCurrentIdx(i)}
            className={`transition-all duration-300 rounded-full ${currentIdx === i ? "w-8 h-2 bg-brand-primary" : "w-2 h-2 bg-brand-primary/20 hover:bg-brand-primary/40"}`} />
        ))}
      </div>
    </div>
  );
}

// ── CategoryCircle ─────────────────────────────────────────────────────────
function CategoryCircle({ cat }: { cat: any }) {
  return (
    <Link href={`/products?category=${cat.slug}`} className="flex flex-col items-center gap-3 shrink-0 group outline-none">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#fcfbf9] border border-[#E8E6E1] group-hover:border-brand-primary/50 group-hover:bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)] group-hover:shadow-[0_12px_25px_rgba(0,0,0,0.08)] transition-all duration-500 flex items-center justify-center group-hover:-translate-y-1.5 ring-4 ring-transparent group-hover:ring-brand-primary/5 overflow-hidden">
        {cat.image ? (
          <Image src={cat.image} alt={cat.name} width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <Leaf className="w-8 h-8 text-brand-primary/30 group-hover:scale-110 group-hover:text-brand-primary transition-all duration-500" strokeWidth={1.5} />
        )}
      </div>
      <span className="text-[11px] sm:text-[12px] font-black text-brand-text uppercase tracking-widest text-center leading-tight max-w-[85px] group-hover:text-brand-primary transition-colors">{cat.name}</span>
    </Link>
  );
}

// ── TestimonialsSection ─────────────────────────────────────────────────────
function TestimonialsSection({ reviews }: { reviews: any[] }) {
  const [page, setPage] = useState(0);
  const PER_PAGE = 6;
  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const visible = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  if (reviews.length === 0) return null;

  return (
    <section className="mt-12 px-4 pb-2">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[26px] sm:text-[34px] font-black text-brand-primary font-serif text-center mb-8 tracking-tight">
          500+ Happy Clients
        </h2>
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          <div className="relative w-full lg:w-[260px] shrink-0 rounded-2xl overflow-hidden min-h-[220px] lg:min-h-0 shadow-md">
            <Image src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop"
              alt="Healthy dry fruits mix" fill sizes="(max-width: 1024px) 100vw, 260px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white text-lg font-black leading-tight mb-1">Have this daily.<br /><span className="text-brand-accent">Double your energy.</span></p>
              <Link href="/products" className="inline-flex items-center gap-1.5 mt-3 bg-brand-accent text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg hover:bg-[#c49015] transition-colors">
                Shop Now <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="flex-1 flex gap-4 items-center">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {visible.map((r, i) => (
                <motion.div key={`${page}-${i}`}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-[#ECEAE5] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.07)] transition-shadow duration-300 flex flex-col justify-between min-h-[120px]">
                  <p className="text-[13px] text-[#3a3a3a] leading-relaxed font-medium mb-3 flex-1">{r.text}</p>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-3 h-3 ${star <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-[12px] font-black text-brand-text">
                    {r.name} <span className="text-brand-text-muted font-semibold">- {r.detail || r.location}</span>
                  </p>
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="hidden sm:flex flex-col gap-2.5 pl-1 shrink-0">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)} aria-label={`Page ${i + 1}`}
                    style={{ width: i === page ? "10px" : "8px", height: i === page ? "10px" : "8px", borderRadius: "50%", background: i === page ? "#1a3a20" : "#ccc" }}
                    className="transition-all duration-300" />
                ))}
              </div>
            )}
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex sm:hidden justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`rounded-full transition-all duration-300 ${i === page ? "w-6 h-2 bg-brand-primary" : "w-2 h-2 bg-gray-300"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── NewArrivalAddBtn ────────────────────────────────────────────────────────
function NewArrivalAddBtn({ product }: { product: any }) {
  const { addItem } = useCartStore((s) => s);
  const [adding, setAdding] = useState(false);

  const handle = () => {
    setAdding(true);
    addItem({
      id: product._id?.toString() || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || "",
      vendorId: product.vendorId?.toString() || "",
    });
    showSuccess("Added to Cart!", `${product.name} is now in your cart.`);
    setTimeout(() => setAdding(false), 900);
  };

  return (
    <button onClick={handle}
      className={`w-full py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-200 border ${adding ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white"}`}>
      {adding ? "Added ✓" : "+ Add to Cart"}
    </button>
  );
}

// ── BrandCarousel ───────────────────────────────────────────────────────────
function BrandCarousel({ categories }: { categories: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const SPEED = 0.8;

  const baseItems = categories.map((c) => ({ ...c, id: c._id || Math.random(), isAll: false }));
  const allItems = baseItems.length > 0 ? [...baseItems, ...baseItems, ...baseItems, ...baseItems, ...baseItems, ...baseItems] : [];

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    const track = trackRef.current;
    if (!track) return;
    const trackWidth = track.scrollWidth / (allItems.length / baseItems.length);
    const tick = () => {
      if (!pausedRef.current && track && !isDraggingRef.current) posRef.current += SPEED;
      if (trackWidth > 0) {
        while (posRef.current < 0) posRef.current += trackWidth;
        while (posRef.current >= trackWidth) posRef.current -= trackWidth;
      }
      if (track) track.style.transform = `translateX(-${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("resize", handleResize); cancelAnimationFrame(rafRef.current); };
  }, [baseItems.length, allItems.length]);

  const handlePointerDown = (e: React.PointerEvent) => { isDraggingRef.current = true; startXRef.current = e.clientX; pausedRef.current = true; };
  const handlePointerMove = (e: React.PointerEvent) => { if (!isDraggingRef.current) return; posRef.current += startXRef.current - e.clientX; startXRef.current = e.clientX; };
  const handlePointerUp = () => { isDraggingRef.current = false; pausedRef.current = false; };

  if (allItems.length === 0) return null;

  return (
    <section className="mt-12 overflow-hidden py-12 relative bg-gradient-to-b from-transparent via-[#FAF9F6]/30 to-transparent group">
      <div className="px-4 max-w-7xl mx-auto mb-2 flex flex-col items-center text-center">
        <p className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.4em] mb-1">Discover</p>
        <h2 className="text-[26px] sm:text-[34px] font-black text-brand-text uppercase tracking-widest font-serif leading-none">Shop by Category</h2>
      </div>
      <button onClick={() => { posRef.current -= 200; }} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white backdrop-blur-md border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-brand-primary transition-all duration-300 hover:scale-110" aria-label="Scroll left">
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
      </button>
      <button onClick={() => { posRef.current += 200; }} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white backdrop-blur-md border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-brand-primary transition-all duration-300 hover:scale-110" aria-label="Scroll right">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
      </button>
      <div ref={wrapRef} className="relative w-full min-h-[180px] sm:min-h-[280px] mt-2 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-pan-y"
        onMouseEnter={() => { pausedRef.current = true; }} onMouseLeave={() => { pausedRef.current = false; setHoveredIdx(null); handlePointerUp(); }}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        <div ref={trackRef} className="flex gap-6 sm:gap-12 will-change-transform absolute left-0 transition-transform duration-75 ease-out" style={{ width: "max-content", touchAction: "none" }}>
          {allItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="relative flex flex-col items-center shrink-0" onMouseEnter={() => setHoveredIdx(idx)}>
              <ArcItem item={item} idx={idx} posRef={posRef} wrapRef={wrapRef} isHovered={hoveredIdx === idx} windowWidth={windowWidth} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArcItem({ item, idx, posRef, wrapRef, isHovered, windowWidth }: any) {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const [transform, setTransform] = useState({ y: 0, scale: 1, opacity: 1 });

  useEffect(() => {
    let raf: number;
    const updateMotion = () => {
      const el = itemRef.current;
      const wrap = wrapRef.current;
      if (!el || !wrap) return;
      const rect = el.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const dist = (rect.left + rect.width / 2 - (wrapRect.left + wrapRect.width / 2)) / (windowWidth / 1.5);
      const absDist = Math.abs(dist);
      const arcDepth = windowWidth < 640 ? 60 : 120;
      const y = Math.min(absDist * absDist * arcDepth, arcDepth + 50);
      const scaleBase = windowWidth < 640 ? 0.85 : 1;
      const scale = scaleBase + Math.max(0, 1 - absDist * 1.5) * 0.25;
      const opacity = Math.max(0, 1 - absDist * absDist * 0.8);
      setTransform({ y, scale, opacity });
      raf = requestAnimationFrame(updateMotion);
    };
    raf = requestAnimationFrame(updateMotion);
    return () => cancelAnimationFrame(raf);
  }, [windowWidth]);

  return (
    <Link ref={itemRef} href={`/products?category=${item.slug}`} className="flex flex-col items-center gap-5 transition-transform duration-300 ease-out"
      style={{ transform: `translateY(${transform.y}px) scale(${transform.scale + (isHovered ? 0.1 : 0)})`, opacity: transform.opacity, zIndex: Math.round(100 - transform.y) }}>
      <div className="relative group">
        <div className={`absolute -inset-4 rounded-full transition-all duration-700 blur-xl opacity-0 group-hover:opacity-60 bg-brand-primary/20 ${transform.scale > 1.15 ? "opacity-40" : ""}`} />
        <div className={`absolute -inset-2 rounded-full border-2 border-brand-primary/10 transition-all duration-500 scale-90 group-hover:scale-100 group-hover:border-brand-primary/40 ${transform.scale > 1.2 ? "border-brand-primary/30 scale-100" : ""}`} />
        <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white border border-[#E8E6E1] shadow-[0_4px_10px_rgba(0,0,0,0.03)] group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)] flex items-center justify-center transition-all duration-500 overflow-hidden">
          {item.image ? (
            <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <Leaf className="w-10 h-10 text-brand-primary/30" strokeWidth={1.5} />
          )}
        </div>
      </div>
      <div className="w-[80px] sm:w-[120px] px-1">
        <span className={`block text-[8px] sm:text-[9.5px] font-black text-brand-text uppercase tracking-[0.12em] text-center transition-all duration-300 leading-tight ${isHovered || transform.scale > 1.2 ? "text-brand-primary scale-105" : "opacity-60"}`}>
          {item.name}
        </span>
      </div>
    </Link>
  );
}

// ── BenefitsCarousel ────────────────────────────────────────────────────────
function BenefitsCarousel({ items }: { items: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const SPEED = 0.55;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const halfWidth = track.scrollWidth / 2;
    const tick = () => {
      if (!pausedRef.current && track && !isDraggingRef.current) posRef.current += SPEED;
      if (halfWidth > 0) {
        while (posRef.current < 0) posRef.current += halfWidth;
        while (posRef.current >= halfWidth) posRef.current -= halfWidth;
      }
      if (track) track.style.transform = `translateX(-${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => { isDraggingRef.current = true; startXRef.current = e.clientX; pausedRef.current = true; };
  const handlePointerMove = (e: React.PointerEvent) => { if (!isDraggingRef.current) return; posRef.current += startXRef.current - e.clientX; startXRef.current = e.clientX; };
  const handlePointerUp = () => { isDraggingRef.current = false; pausedRef.current = false; };

  if (items.length === 0) return null;
  const allItems = [...items, ...items, ...items];

  return (
    <section className="mt-16 overflow-hidden bg-[#FAF7F2] py-8 relative group/benefits">
      <div className="px-4 max-w-7xl mx-auto mb-10 text-center">
        <p className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.3em] mb-2">Immunity & Vitality</p>
        <h2 className="text-[24px] sm:text-[32px] font-black text-brand-text uppercase tracking-widest font-serif leading-tight">Nature's Pick: Health Benefits</h2>
      </div>
      <button onClick={() => { posRef.current -= 340; }} className="absolute left-2 sm:left-6 top-[60%] -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white backdrop-blur-md border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-brand-primary transition-all duration-300 hover:scale-110" aria-label="Scroll left">
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
      </button>
      <button onClick={() => { posRef.current += 340; }} className="absolute right-2 sm:right-6 top-[60%] -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white backdrop-blur-md border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-brand-primary transition-all duration-300 hover:scale-110" aria-label="Scroll right">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
      </button>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#FAF7F2] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#FAF7F2] to-transparent pointer-events-none" />
        <div className="overflow-hidden cursor-grab active:cursor-grabbing pb-10 select-none touch-pan-y"
          onMouseEnter={() => { pausedRef.current = true; }} onMouseLeave={() => { pausedRef.current = false; handlePointerUp(); }}
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
          <div ref={trackRef} className="flex gap-6 will-change-transform px-4 transition-transform duration-75 ease-out" style={{ width: "max-content", touchAction: "none" }}>
            {allItems.map((item, idx) => (
              <div key={`${item._id || item.name}-${idx}`}
                className="w-[280px] sm:w-[320px] bg-white rounded-[2.5rem] border border-[#E8E6E1] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 group flex flex-col items-start gap-5 pointer-events-none">
                <div className={`w-16 h-16 rounded-3xl ${item.bgColor || "bg-amber-50"} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-all duration-500`}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-2" />
                  ) : (
                    <motion.div whileHover={{ scale: 1.15, rotate: [0, 5, -5, 0] }} transition={{ duration: 0.3 }} className="w-10 h-10 flex items-center justify-center relative z-10">
                      {BENEFIT_SVGS[item.iconType] || BENEFIT_SVGS.mixed}
                    </motion.div>
                  )}
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                </div>
                <div className="w-full">
                  <h3 className="text-lg font-black text-brand-text mb-1 group-hover:text-brand-primary transition-colors">{item.name}</h3>
                  <p className="text-[11px] font-bold text-brand-primary uppercase tracking-widest mb-4 italic">"{item.tagline}"</p>
                  <ul className="space-y-2.5 mb-6">
                    {(item.benefits || []).map((benefit: string, i: number) => (
                      <li key={i} className="flex items-center gap-2.5 text-[12px] font-bold text-brand-text-muted">
                        <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <div className="w-full h-px bg-[#F0EDE8] mb-4" />
                  <p className="text-[12px] font-medium text-brand-text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ Item ───────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8E6E1] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left">
        <span className="text-sm font-bold text-brand-text pr-2">{q}</span>
        <span className={`shrink-0 w-5 h-5 rounded-full border-2 border-brand-primary flex items-center justify-center transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          {open ? <Minus className="w-2.5 h-2.5 text-brand-primary" /> : <Plus className="w-2.5 h-2.5 text-brand-primary" />}
        </span>
      </button>
      {open && <p className="text-sm text-brand-text-muted font-medium pb-4 leading-relaxed pr-6">{a}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function HomeClient({
  dbBanners = [],
  dbProducts = [],
  dbCategories = [],
  dbNewArrivals = [],
  dbFaqs = [],
  dbTestimonials = [],
  dbQualityCards = [],
  dbBenefitProducts = [],
  dbHomeSettings = null,
}: {
  dbBanners?: any[];
  dbProducts: any[];
  dbCategories?: any[];
  dbNewArrivals?: any[];
  dbFaqs?: any[];
  dbTestimonials?: any[];
  dbQualityCards?: any[];
  dbBenefitProducts?: any[];
  dbHomeSettings?: HomeSettingsData | null;
}) {
  const slides = dbBanners.length > 0
    ? dbBanners.map((b: any) => ({ img: b.imageUrl, title: b.title }))
    : [];

  const [[heroIdx, direction], setHeroState] = useState([0, 0]);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollRefNature = useRef<HTMLDivElement>(null);
  const scrollPosNature = useRef(0);
  const [isPausedNature, setIsPausedNature] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    const speed = 0.8;
    const startScroll = () => {
      if (!isPausedNature && scrollRefNature.current) {
        const el = scrollRefNature.current;
        scrollPosNature.current += speed;
        if (scrollPosNature.current >= el.scrollWidth / 2) scrollPosNature.current = 0;
        el.scrollLeft = scrollPosNature.current;
      }
      animationFrameId = requestAnimationFrame(startScroll);
    };
    animationFrameId = requestAnimationFrame(startScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPausedNature]);

  const paginate = useCallback((newDir: number) => {
    setHeroState(([prev]) => [(prev + newDir + slides.length) % slides.length, newDir]);
  }, [slides.length]);

  const goTo = useCallback((idx: number) => {
    setHeroState(([prev]) => [idx, idx > prev ? 1 : -1]);
  }, []);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => paginate(1), 5500);
  }, [paginate]);

  useEffect(() => {
    if (slides.length === 0) return;
    resetAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [slides.length, resetAutoPlay]);

  const hs = dbHomeSettings;
  const trustStrip = hs?.trustStrip || [];
  const benefits = hs?.benefits || [];
  const purposes = hs?.purposes || [];
  const qualityClaims = hs?.qualityClaims || [];
  const whyPjBite = hs?.whyPjBite || [];
  const howItWorks = hs?.howItWorks || [];
  const bulkOrder = hs?.bulkOrder || { badge: "Corporate & Wholesale", title: "Big Savings on Bulk Orders!", subtitle: "" };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-28 lg:pb-8">

      {/* ── HERO SECTION ── */}
      {slides.length > 0 && (
        <section className="relative">
          <div className="relative w-full h-[60vw] min-h-[320px] max-h-[500px] bg-[#1a3a20] overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div key={heroIdx} custom={direction}
                initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }} exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.5 }}
                transition={{ type: "tween", ease: [0.77, 0, 0.18, 1], duration: 0.25 }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1}
                onDragEnd={(_, info) => { if (info.offset.x < -60) { paginate(1); resetAutoPlay(); } else if (info.offset.x > 60) { paginate(-1); resetAutoPlay(); } }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing">
                <Image src={slides[heroIdx]?.img} alt={slides[heroIdx]?.title || "Hero banner"} fill priority={heroIdx === 0} className="object-cover scale-[1.04] animate-ken-burns" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-10 pb-16 sm:pb-20">
                  <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}>
                    <p className="text-brand-accent text-[10px] font-black uppercase tracking-[0.3em] mb-2 drop-shadow-md">PJ Bite Premium</p>
                    <h1 className="text-white text-[22px] sm:text-3xl font-black font-serif leading-tight mb-4 max-w-sm sm:max-w-lg drop-shadow-xl">{slides[heroIdx]?.title}</h1>
                    <Link href="/products" className="inline-flex items-center gap-2 bg-brand-primary text-white text-xs font-black px-6 py-3 rounded-full uppercase tracking-widest hover:bg-[#164a20] transition-colors shadow-lg">
                      Shop Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => { paginate(-1); resetAutoPlay(); }} aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <button onClick={() => { paginate(1); resetAutoPlay(); }} aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {slides.map((_, dotIdx) => (
                <button key={dotIdx} onClick={() => { goTo(dotIdx); resetAutoPlay(); }} aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`transition-all duration-400 rounded-full ${heroIdx === dotIdx ? "w-7 h-2 bg-brand-accent shadow-md" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`} />
              ))}
            </div>
            <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
              <span className="text-white text-[11px] font-black">{heroIdx + 1}</span>
              <span className="text-white/40 text-[11px]">/</span>
              <span className="text-white/60 text-[11px] font-bold">{slides.length}</span>
            </div>
          </div>

          {/* Trust Strip */}
          {trustStrip.length > 0 && (
            <div className="w-[92%] sm:w-auto sm:mx-8 lg:mx-auto lg:max-w-4xl mx-auto -mt-6 sm:-mt-8 rounded-2xl sm:rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.06)] bg-white/95 backdrop-blur-md relative z-10 border border-[#E8E6E1]/50 p-0.5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5 overflow-hidden rounded-xl sm:rounded-[1.8rem]">
                {trustStrip.map((s, idx) => (
                  <motion.div key={s.label} whileHover={{ y: -2 }} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="py-3 sm:py-5 px-2 sm:px-6 bg-white flex flex-col items-center justify-center gap-1.5 hover:bg-brand-bg transition-colors cursor-default group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 opacity-80 group-hover:scale-110 transition-transform duration-300">
                        {TRUST_SVGS[s.iconType] || TRUST_SVGS["no-color"]}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] sm:text-[10px] text-brand-text font-black uppercase tracking-wider leading-none mb-1">{s.label}</p>
                      <p className="text-[7.5px] sm:text-[8px] text-brand-primary/60 font-black uppercase tracking-[0.2em] leading-none">{s.subline}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── NEW ARRIVALS ── */}
      {dbNewArrivals.length > 0 && (
        <section className="mt-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                    <Sparkles className="w-5 h-5 text-[#D4A017]" strokeWidth={2} />
                  </motion.div>
                  <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-[#D4A017]/20" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#D4A017] uppercase tracking-[0.3em] leading-none mb-0.5">Just Landed</p>
                  <h2 className="text-base font-black text-brand-text uppercase tracking-widest leading-none">New Arrivals</h2>
                </div>
              </div>
              <Link href="/products" className="text-[11px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                See All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4">
              {dbNewArrivals.map((p: any, i: number) => (
                <motion.div key={p._id?.toString() || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }} className="shrink-0 w-[160px] sm:w-[220px]">
                  <ProductCard product={{ ...p, tag: "New" }} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SHOP BY BRAND ── */}
      <BrandCarousel categories={dbCategories || []} />

      {/* ── FEATURED PRODUCTS ── */}
      {dbProducts.length > 0 && (
        <section className="mt-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-brand-text uppercase tracking-widest">Top Selling Products</h2>
              <Link href="/products" className="text-xs font-black text-brand-primary flex items-center gap-1 hover:underline">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {dbProducts.slice(0, 4).map((p: any, i: number) => (
                <ProductCard key={p._id?.toString() || i} product={{ ...p, tag: i === 0 ? "Bestseller" : i === 1 ? "New" : "Popular" }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFITS STRIP ── */}
      {benefits.length > 0 && (
        <section className="mt-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {benefits.map((b) => (
                <div key={b.label} className="bg-white rounded-2xl border border-[#E8E6E1] p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <DynIcon name={b.iconName} className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-text">{b.label}</p>
                    <p className="text-[10px] text-brand-text-muted font-medium leading-tight">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── QUALITY CLAIMS MARQUEE ── */}
      {qualityClaims.length > 0 && (
        <section className="mt-6 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#1a3a20] rounded-2xl py-4 px-6 overflow-hidden relative">
              <div className="flex animate-marquee whitespace-nowrap gap-0">
                {[...qualityClaims, ...qualityClaims].map((claim, i) => (
                  <span key={i} className="text-[#a3c96e] text-[11px] font-black uppercase tracking-widest mx-6 shrink-0">{claim}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── MORE PRODUCTS ── */}
      {dbProducts.length > 4 && (
        <section className="mt-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-brand-text uppercase tracking-widest">Healthy Snacking</h2>
              <Link href="/products" className="text-xs font-black text-brand-primary flex items-center gap-1 hover:underline">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {dbProducts.slice(4, 8).map((p: any, i: number) => (
                <ProductCard key={p._id?.toString() || `h${i}`} product={{ ...p, tag: "Fresh" }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SHOP BY PURPOSE ── */}
      {purposes.length > 0 && (
        <section className="mt-10 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-base font-black text-brand-text uppercase tracking-widest mb-2 text-center">Shop By Purpose</h2>
            <p className="text-xs text-brand-text-muted text-center font-medium mb-5">We just made it easy for you to shop on your terms. Let's get started to find your way for passion for healthy nutrition.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {purposes.map((p, idx) => (
                <Link key={p.label} href={p.href}
                  className="bg-white rounded-[20px] border border-[#E8E6E1] p-6 flex flex-col items-center gap-4 hover:border-brand-primary/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)] transition-all duration-300 group">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="w-14 h-14 rounded-full bg-[#f8f6f0] flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 text-brand-primary">
                    <DynIcon name={p.iconName} className="w-6 h-6" />
                  </motion.div>
                  <span className="text-[13px] font-black text-brand-text uppercase tracking-widest group-hover:text-brand-primary transition-colors">{p.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BULK ORDER BANNER ── */}
      <section className="mt-10 mx-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-brand-primary to-[#164a20] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="text-brand-accent text-[10px] font-black uppercase tracking-widest mb-2">{bulkOrder.badge}</p>
              <h2 className="text-white text-xl sm:text-2xl font-black font-serif leading-tight">{bulkOrder.title}</h2>
              {bulkOrder.subtitle && <p className="text-white/70 text-xs font-medium mt-2">{bulkOrder.subtitle}</p>}
            </div>
            <Link href="/contact" className="shrink-0 bg-white text-brand-primary text-xs font-black px-6 py-3 rounded-full uppercase tracking-widest hover:bg-brand-bg transition-colors shadow-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY PJ BITE ── */}
      {whyPjBite.length > 0 && (
        <section className="mt-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl bg-[#1a3a20] p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-5 bottom-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-brand-accent text-[10px] font-black uppercase tracking-[0.25em] mb-2">Why Choose Us</p>
                <h2 className="text-white text-xl sm:text-2xl font-black font-serif mb-6 max-w-xs leading-tight">Why PJ Bite is Different</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {whyPjBite.map((f) => (
                    <div key={f.title} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-brand-primary/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <DynIcon name={f.iconName} className="w-4 h-4 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white mb-1">{f.title}</p>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/about" className="inline-flex items-center gap-2 mt-6 bg-white text-brand-primary text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-brand-bg transition-colors shadow-lg">
                  Our Story <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── NATURE'S BENEFITS CAROUSEL ── */}
      <BenefitsCarousel items={dbBenefitProducts} />

      {/* ── QUALITY TRUST SECTION ── */}
      {dbQualityCards.length > 0 && (
        <section className="mt-12 bg-[#E1EFEB] py-14 px-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] border-y border-[#D0E0DC]">
          <div className="max-w-7xl mx-auto">
            <div className="hidden lg:grid grid-cols-4 gap-6">
              {dbQualityCards.map((card, idx) => (
                <div key={card._id} className="bg-[#FAF4E8] rounded-2xl overflow-hidden flex flex-col items-center pt-8 px-5 shadow-sm border border-[#EBE3D3] group transition-all duration-300 hover:shadow-md hover:border-[#D5C9B0]">
                  <div className="text-center mb-5">
                    <Sun className="w-6 h-6 text-[#E0D5B5] mx-auto mb-3" />
                    <h3 className="text-[#1A3A20] text-[16px] font-black leading-tight mb-2 drop-shadow-sm">{card.title}</h3>
                    <p className="text-[#4F5E48] text-[11px] font-bold leading-relaxed">{card.desc}</p>
                  </div>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5 + idx * 0.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
                    className="w-[105%] mt-auto h-52 relative -bottom-2 rounded-t-[20px] overflow-hidden drop-shadow-sm">
                    <Image src={card.img} alt={card.alt || card.title} fill sizes="25vw" className="object-cover object-top scale-100 group-hover:scale-110 transition-transform duration-700" />
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="lg:hidden relative">
              <VerticalQualitySlider cards={dbQualityCards} />
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      {howItWorks.length > 0 && (
        <section className="mt-10 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-base font-black text-brand-text uppercase tracking-widest mb-6 text-center">From Farm to Your Doorstep</h2>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
              <div className="absolute top-7 left-[12.5%] right-[12.5%] h-px bg-dashed border-t-2 border-dashed border-[#E8E6E1] hidden sm:block" />
              {howItWorks.map((s) => (
                <div key={s.step} className="flex flex-col items-center gap-2 relative">
                  <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center shadow-md shadow-brand-primary/20 relative z-10">
                    <DynIcon name={s.iconName} className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-brand-text-muted">{s.step}</span>
                  <p className="text-xs font-black text-brand-text text-center leading-tight">{s.label}</p>
                  <p className="text-[10px] text-brand-text-muted font-medium text-center leading-tight hidden sm:block">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {dbFaqs.length > 0 && (
        <section className="mt-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-base font-black text-brand-text uppercase tracking-widest mb-5 text-center">FAQs</h2>
            <div className="bg-white rounded-2xl border border-[#E8E6E1] px-5 shadow-sm">
              {dbFaqs.map((faq: any, i: number) => (
                <FaqItem key={faq._id || i} q={faq.question} a={faq.answer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection reviews={dbTestimonials} />

    </div>
  );
}
