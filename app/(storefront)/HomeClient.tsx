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

// ── Trust-strip stamp-style badges — red prohibition seal per claim. The
// surrounding label/subline text lives outside the SVG (rendered in the trust
// strip below), so the stamp itself shows only: ridged outer ring + content
// glyph + diagonal "no" slash. Pure SVG, no external images.
const StampBadge = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    {/* Ridged outer ring — 40 tiny triangular teeth around the rim */}
    <g fill="#DC2626">
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i * 360) / 40;
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 48 * Math.cos(rad);
        const y1 = 50 + 48 * Math.sin(rad);
        const x2 = 50 + 44 * Math.cos(rad + 0.07);
        const y2 = 50 + 44 * Math.sin(rad + 0.07);
        const x3 = 50 + 44 * Math.cos(rad - 0.07);
        const y3 = 50 + 44 * Math.sin(rad - 0.07);
        return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} />;
      })}
    </g>
    {/* Double rim */}
    <circle cx="50" cy="50" r="44" stroke="#DC2626" strokeWidth="1.8" fill="white" />
    <circle cx="50" cy="50" r="40" stroke="#DC2626" strokeWidth="1.2" fill="none" />
    {/* Inner content glyph (the thing being prohibited) — scaled larger now
        that there is no curved text to leave room for */}
    <g transform="translate(50 50) scale(1.5)">{children}</g>
    {/* Diagonal "no" slash — drawn last, crosses the glyph */}
    <line x1="22" y1="22" x2="78" y2="78" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const FlaskGlyph = (
  <g stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {/* Erlenmeyer-style flask body */}
    <path d="M -4 -10 L -4 -3 L -10 9 Q -11 12 -7 12 L 7 12 Q 11 12 10 9 L 4 -3 L 4 -10 Z" />
    {/* Neck top rim */}
    <line x1="-6" y1="-10" x2="6" y2="-10" />
    {/* A little drop inside */}
    <circle cx="0" cy="6" r="1.4" fill="#DC2626" stroke="none" />
  </g>
);
const SugarCubesGlyph = (
  <g stroke="#DC2626" strokeWidth="1.4" fill="none">
    {/* Three stacked cubes */}
    <rect x="-9" y="-4" width="8" height="8" />
    <rect x="1"  y="-4" width="8" height="8" />
    <rect x="-4" y="-12" width="8" height="8" />
    {/* Cube highlights */}
    <line x1="-7" y1="-2" x2="-3" y2="-2" />
    <line x1="3" y1="-2" x2="7" y2="-2" />
    <line x1="-2" y1="-10" x2="2" y2="-10" />
  </g>
);
const ChemicalGlyph = (
  <g stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {/* Round-bottom flask with bubbles */}
    <line x1="-3" y1="-12" x2="-3" y2="-4" />
    <line x1="3" y1="-12" x2="3" y2="-4" />
    <line x1="-5" y1="-12" x2="5" y2="-12" />
    <path d="M -3 -4 Q -12 4 -9 10 Q -4 14 0 14 Q 4 14 9 10 Q 12 4 3 -4 Z" />
    {/* Bubbles inside */}
    <circle cx="-2" cy="6" r="1.3" fill="#DC2626" stroke="none" />
    <circle cx="3" cy="9" r="1" fill="#DC2626" stroke="none" />
    <circle cx="0" cy="3" r="0.9" fill="#DC2626" stroke="none" />
  </g>
);
const FlavorDropperGlyph = (
  <g stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {/* Bottle */}
    <rect x="-6" y="-12" width="12" height="3" />
    <path d="M -7 -9 L 7 -9 L 7 12 Q 7 14 5 14 L -5 14 Q -7 14 -7 12 Z" />
    {/* Liquid line */}
    <line x1="-4" y1="3" x2="4" y2="3" />
    {/* Drip below */}
    <path d="M 0 14 Q -2 18 0 20 Q 2 18 0 14 Z" fill="#DC2626" stroke="none" />
  </g>
);

const TRUST_SVGS: Record<string, React.ReactNode> = {
  "no-color":    <StampBadge>{FlaskGlyph}</StampBadge>,
  "no-sugar":    <StampBadge>{SugarCubesGlyph}</StampBadge>,
  "no-chemical": <StampBadge>{ChemicalGlyph}</StampBadge>,
  "no-flavor":   <StampBadge>{FlavorDropperGlyph}</StampBadge>,
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
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  return (
    <div className="group bg-white rounded-[1.5rem] border border-[#EAE7DD] hover:border-brand-primary/30 overflow-hidden shadow-[0_1px_2px_rgba(26,32,16,0.03),0_8px_24px_-16px_rgba(121,174,111,0.14)] hover:shadow-[0_4px_8px_rgba(26,32,16,0.04),0_24px_48px_-20px_rgba(121,174,111,0.25)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative">
      <div className="relative">
        {isOutOfStock && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <span className="bg-brand-text/85 backdrop-blur-sm text-white text-[10px] sm:text-xs font-black px-4 py-2 rounded-full uppercase tracking-[0.25em] shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 items-start">
          {discount > 0 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.tag && !isOutOfStock && (
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
          <div className="aspect-square bg-gradient-to-b from-brand-bg/60 to-brand-bg relative overflow-hidden">
            <Image src={img} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2.5 sm:p-3 group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform" />
          </div>
        </Link>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <p className="text-[9px] sm:text-[10px] font-black text-brand-text-muted uppercase tracking-[0.3em] mb-2">PJ Bite</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif font-black text-brand-text text-[15px] sm:text-[17px] line-clamp-2 leading-[1.2] tracking-tight hover:text-brand-primary transition-colors mb-3" title={product.name}>
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-brand-accent text-brand-accent" />
          ))}
          <span className="text-[10px] text-brand-text-muted font-bold ml-1.5">(12)</span>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-baseline gap-2 text-brand-text">
            <span className="text-lg sm:text-xl font-black tracking-tight">₹{product.price}</span>
            {discount > 0 && <span className="text-[11px] text-brand-text-muted line-through">₹{originalPrice}</span>}
          </div>
          {isOutOfStock ? (
            <button disabled
              className="w-full py-2.5 text-[10px] font-black rounded-xl uppercase tracking-[0.25em] bg-brand-bg text-brand-text-muted border border-[#EAE7DD] cursor-not-allowed">
              Out of Stock
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleAdd}
                className={`flex-1 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] transition-all duration-300 border ${adding ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-text border-brand-text/30 hover:bg-brand-text hover:text-white hover:border-brand-text"}`}>
                {adding ? "Added ✓" : "Add Cart"}
              </button>
              <button onClick={handleBuyNow}
                className="flex-1 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] bg-brand-accent text-brand-text hover:bg-brand-accent-dark transition-all duration-300 shadow-[0_4px_14px_-4px_rgba(244,197,66,0.5)]">
                Buy Now
              </button>
            </div>
          )}
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
            {card.reportUrl && (
              <a
                href={card.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-[10px] font-black text-brand-primary uppercase tracking-[0.18em]"
              >
                View Report <ArrowRight className="w-3 h-3" />
              </a>
            )}
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

// ── TestimonialsSection ─────────────────────────────────────────────────────
function TestimonialsSection({ reviews }: { reviews: any[] }) {
  const [page, setPage] = useState(0);
  const PER_PAGE = 6;
  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const visible = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  if (reviews.length === 0) return null;

  return (
    <section className="mt-20 sm:mt-28 px-4 pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="pj-eyebrow pj-eyebrow--center mb-4">Loved by 500+</p>
          <h2 className="pj-heading">What our customers say</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          <div className="relative w-full lg:w-[260px] shrink-0 rounded-2xl overflow-hidden min-h-[220px] lg:min-h-0 shadow-md">
            <Image src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop"
              alt="Assorted fresh fruits" fill sizes="(max-width: 1024px) 100vw, 260px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white text-lg font-black leading-tight mb-1">Have this daily.<br /><span className="text-brand-accent">Double your energy.</span></p>
              <Link href="/products" className="inline-flex items-center gap-1.5 mt-3 bg-brand-accent text-brand-text text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg hover:bg-brand-accent-dark transition-colors">
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

// ── ShopByCategoryGrid ─────────────────────────────────────────────────────
// Per PDF spec: only two categories — Dried Fruits and Dried Vegetables.
function ShopByCategoryGrid({ categories }: { categories: any[] }) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const pick = (needle: string) =>
    categories.find((c) => norm(c.name || "").includes(needle) || norm(c.slug || "").includes(needle));

  const driedFruits = pick("driedfruit") || pick("dryfruit");
  const driedVeg   = pick("driedveg")   || pick("dryveg") || pick("vegetable");

  const fallback = (name: string, slug: string, image?: string) => ({ name, slug, image });
  const items = [
    driedFruits || fallback("Dried Fruits", "dried-fruits"),
    driedVeg    || fallback("Dried Vegetables", "dried-vegetables"),
  ];

  return (
    <section className="mt-20 sm:mt-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="pj-eyebrow pj-eyebrow--center mb-4">Discover</p>
          <h2 className="pj-heading">Shop by Category</h2>
          <p className="pj-subhead mt-4">
            Two simple, honest selections — sun-dried fruits and farm-fresh dried vegetables. Nothing else.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {items.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden bg-brand-bg border border-[#E8E6E1] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-bg">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
                    <Leaf className="w-20 h-20 text-brand-primary/40" strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
                <h3 className="text-white text-lg sm:text-2xl font-black font-serif tracking-tight drop-shadow-md">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 bg-brand-accent text-brand-text text-[10px] sm:text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg group-hover:bg-brand-accent-dark transition-colors">
                  Shop <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── BenefitsCarousel ────────────────────────────────────────────────────────
// Performance note: this used to be a 60fps requestAnimationFrame loop that
// repainted translateX every frame even off-screen. Replaced with a CSS
// `animate-marquee-slow` keyframe — handed off to the GPU compositor for free.
function BenefitsCarousel({ items }: { items: any[] }) {
  const [paused, setPaused] = useState(false);

  if (items.length === 0) return null;
  // Duplicate once for seamless loop — CSS keyframes go 0% → -50%
  const allItems = [...items, ...items];

  return (
    <section className="mt-20 sm:mt-28 overflow-hidden bg-gradient-to-b from-brand-bg via-white to-brand-bg py-14 relative">
      <div className="px-4 max-w-7xl mx-auto mb-14 text-center">
        <p className="pj-eyebrow pj-eyebrow--center mb-4">Immunity & Vitality</p>
        <h2 className="pj-heading">Nature&apos;s Pick</h2>
        <p className="pj-subhead mt-4 mx-auto">Functional ingredients backed by tradition and science.</p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-brand-bg to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-brand-bg to-transparent pointer-events-none" />
        <div className="overflow-hidden pb-10"
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div
            className="flex gap-6 px-4 animate-marquee-slow"
            style={{ width: "max-content", animationPlayState: paused ? "paused" : "running" }}
          >
            {allItems.map((item, idx) => (
              <div key={`${item._id || item.name}-${idx}`}
                className="w-[280px] sm:w-[320px] bg-white rounded-[2.5rem] border border-[#EAE7DD] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500 group flex flex-col items-start gap-5">
                <div className={`w-16 h-16 rounded-3xl ${item.bgColor || "bg-amber-50"} flex items-center justify-center relative overflow-hidden`}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-2" />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center relative z-10">
                      {BENEFIT_SVGS[item.iconType] || BENEFIT_SVGS.mixed}
                    </div>
                  )}
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
    <div className="bg-brand-bg min-h-screen pb-28 lg:pb-8">

      {/* ── HERO SECTION ── */}
      {slides.length > 0 && (
        <section className="relative">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-[#0E1A0F] overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div key={heroIdx} custom={direction}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.08}
                onDragEnd={(_, info) => { if (info.offset.x < -60) { paginate(1); resetAutoPlay(); } else if (info.offset.x > 60) { paginate(-1); resetAutoPlay(); } }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing">
                <Image src={slides[heroIdx]?.img} alt={slides[heroIdx]?.title || "Hero banner"} fill priority={heroIdx === 0} sizes="100vw" className="object-cover" draggable={false} />
                {/* Editorial gradient — darker at bottom-left for copy legibility, breathes on the right */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
                    <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-xl">
                      <p className="pj-eyebrow text-brand-accent mb-5 drop-shadow-md">PJ Bite Premium</p>
                      <h1 className="text-white font-serif font-black tracking-tight leading-[1.05] mb-6 drop-shadow-2xl"
                          style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}>
                        {slides[heroIdx]?.title}
                      </h1>
                      <div className="flex items-center gap-4">
                        <Link href="/products" className="group inline-flex items-center gap-2.5 bg-brand-accent text-brand-text text-[11px] sm:text-xs font-black px-7 sm:px-8 py-3.5 sm:py-4 rounded-full uppercase tracking-[0.25em] hover:bg-brand-accent-dark transition-all duration-300 shadow-[0_12px_28px_-10px_rgba(244,197,66,0.6)] hover:shadow-[0_18px_36px_-10px_rgba(244,197,66,0.7)] hover:-translate-y-0.5">
                          Shop Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/about" className="hidden sm:inline-flex items-center gap-2 text-white/85 hover:text-white text-[11px] font-black uppercase tracking-[0.25em] transition-colors border-b border-white/30 hover:border-white pb-1">
                          Our Story
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => { paginate(-1); resetAutoPlay(); }} aria-label="Previous slide"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 hover:scale-105">
              <ChevronLeft className="w-5 h-5 text-white" strokeWidth={1.8} />
            </button>
            <button onClick={() => { paginate(1); resetAutoPlay(); }} aria-label="Next slide"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 hover:scale-105">
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={1.8} />
            </button>
            <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {slides.map((_, dotIdx) => (
                <button key={dotIdx} onClick={() => { goTo(dotIdx); resetAutoPlay(); }} aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`transition-all duration-500 ${heroIdx === dotIdx ? "w-10 h-[3px] bg-brand-accent" : "w-5 h-[3px] bg-white/35 hover:bg-white/60"}`} />
              ))}
            </div>
            <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 text-white/70 font-mono">
              <span className="text-white text-[13px] font-black tracking-wider">{String(heroIdx + 1).padStart(2, "0")}</span>
              <span className="w-6 h-px bg-white/30" />
              <span className="text-white/60 text-[13px] font-bold tracking-wider">{String(slides.length).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Trust Strip */}
          {trustStrip.length > 0 && (
            <div className="w-[94%] sm:w-auto sm:mx-8 lg:mx-auto lg:max-w-5xl mx-auto -mt-10 sm:-mt-14 rounded-2xl sm:rounded-[1.5rem] bg-white relative z-10 border border-[#EAE7DD] shadow-[0_12px_40px_-12px_rgba(26,32,16,0.12)] overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-x divide-[#EAE7DD] lg:divide-y-0">
                {trustStrip.map((s, idx) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`py-6 sm:py-8 px-3 sm:px-6 bg-white flex flex-col items-center justify-center gap-3 hover:bg-brand-bg/60 transition-colors cursor-default group ${idx === 0 ? "border-l-0" : ""}`}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {TRUST_SVGS[s.iconType] || TRUST_SVGS["no-color"]}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] sm:text-[11px] text-brand-text font-black uppercase tracking-[0.18em] leading-none mb-1.5">{s.label}</p>
                      <p className="text-[8.5px] sm:text-[9px] text-brand-text-muted font-bold uppercase tracking-[0.22em] leading-none">{s.subline}</p>
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
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10 gap-6">
              <div>
                <p className="pj-eyebrow mb-3">Just Landed</p>
                <h2 className="pj-heading-sm">New Arrivals</h2>
              </div>
              <Link href="/products" className="group hidden sm:inline-flex items-center gap-2 text-[11px] font-black text-brand-text uppercase tracking-[0.25em] border-b border-brand-text/30 hover:border-brand-primary hover:text-brand-primary pb-1 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4">
              {dbNewArrivals.map((p: any, i: number) => (
                <motion.div key={p._id?.toString() || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="shrink-0 w-[230px] sm:w-[300px]">
                  <ProductCard product={{ ...p, tag: "New" }} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SHOP BY CATEGORY (Dried Fruits + Dried Vegetables) ── */}
      <ShopByCategoryGrid categories={dbCategories || []} />

      {/* ── FEATURED PRODUCTS ── */}
      {dbProducts.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10 gap-6">
              <div>
                <p className="pj-eyebrow mb-3">Bestsellers</p>
                <h2 className="pj-heading-sm">Top Selling Products</h2>
              </div>
              <Link href="/products" className="group hidden sm:inline-flex items-center gap-2 text-[11px] font-black text-brand-text uppercase tracking-[0.25em] border-b border-brand-text/30 hover:border-brand-primary hover:text-brand-primary pb-1 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {dbProducts.slice(0, 4).map((p: any, i: number) => (
                <ProductCard key={p._id?.toString() || i} product={{ ...p, tag: i === 0 ? "Bestseller" : i === 1 ? "New" : "Popular" }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFITS STRIP ── */}
      {benefits.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {benefits.map((b, i) => (
                <motion.div key={b.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group pj-card p-5 sm:p-6 flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-primary/8 border border-brand-primary/15 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:border-brand-primary transition-colors duration-500">
                    <DynIcon name={b.iconName} className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-brand-text tracking-tight">{b.label}</p>
                    <p className="text-[11px] text-brand-text-muted font-medium leading-snug mt-0.5">{b.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── QUALITY CLAIMS MARQUEE ── */}
      {qualityClaims.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <div className="relative overflow-hidden border-y border-brand-primary/15 bg-gradient-to-r from-brand-bg via-white to-brand-bg py-6">
            <div className="flex animate-marquee whitespace-nowrap gap-0">
              {[...qualityClaims, ...qualityClaims].map((claim, i) => (
                <span key={i} className="text-brand-primary text-[11px] sm:text-[12px] font-black uppercase tracking-[0.35em] mx-10 shrink-0 flex items-center gap-3">
                  {claim}
                  <span className="w-1 h-1 rounded-full bg-brand-accent" />
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MORE PRODUCTS ── */}
      {dbProducts.length > 4 && (
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10 gap-6">
              <div>
                <p className="pj-eyebrow mb-3">Everyday Picks</p>
                <h2 className="pj-heading-sm">Healthy Snacking</h2>
              </div>
              <Link href="/products" className="group hidden sm:inline-flex items-center gap-2 text-[11px] font-black text-brand-text uppercase tracking-[0.25em] border-b border-brand-text/30 hover:border-brand-primary hover:text-brand-primary pb-1 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {dbProducts.slice(4, 8).map((p: any, i: number) => (
                <ProductCard key={p._id?.toString() || `h${i}`} product={{ ...p, tag: "Fresh" }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SHOP BY PURPOSE ── */}
      {purposes.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <p className="pj-eyebrow pj-eyebrow--center mb-4">Curated</p>
              <h2 className="pj-heading-sm">Shop By Purpose</h2>
              <p className="pj-subhead mt-4">A simple way to find what fits your day — from gifting to gym fuel.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
              {purposes.map((p, idx) => (
                <Link key={p.label} href={p.href}
                  className="group pj-card p-8 flex flex-col items-center gap-5 text-center">
                  <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="w-16 h-16 rounded-full bg-brand-bg border border-brand-primary/15 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all duration-500">
                    <DynIcon name={p.iconName} className="w-7 h-7" />
                  </motion.div>
                  <span className="text-[12px] font-black text-brand-text uppercase tracking-[0.25em] group-hover:text-brand-primary transition-colors">{p.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BULK ORDER BANNER ── */}
      <section className="mt-20 sm:mt-28 mx-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[2rem] bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-primary-light p-10 sm:p-14 overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-accent/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08),_transparent_60%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <p className="inline-block bg-brand-accent text-brand-text font-black text-[11px] sm:text-[12px] uppercase tracking-[0.32em] px-4 py-1.5 rounded-full mb-5 shadow-[0_8px_20px_-6px_rgba(244,197,66,0.6)]">{bulkOrder.badge}</p>
                <h2 className="text-white font-serif font-black tracking-tight leading-[1.1]"
                    style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", letterSpacing: "-0.015em" }}>
                  {/* Strip emoji from legacy/seeded titles (e.g. the peanut in "Big Savings on Bulk Orders! 🥜") */}
                  {bulkOrder.title.replace(/[\p{Extended_Pictographic}]/gu, "").trim()}
                </h2>
                {bulkOrder.subtitle && (
                  <p className="text-white/75 text-sm sm:text-base font-medium mt-5 leading-relaxed max-w-xl">{bulkOrder.subtitle}</p>
                )}
              </div>
              <Link href="/contact" className="group shrink-0 inline-flex items-center gap-2.5 bg-brand-accent text-brand-text text-xs font-black px-8 py-4 rounded-full uppercase tracking-[0.25em] hover:bg-brand-accent-dark transition-all duration-300 shadow-[0_12px_28px_-10px_rgba(244,197,66,0.6)] hover:-translate-y-0.5">
                Contact Us <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PJ BITE ── */}
      {whyPjBite.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[2rem] bg-[#0E1A0F] p-10 sm:p-16 overflow-hidden">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-brand-primary/25 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-brand-accent/12 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(121,174,111,0.18),_transparent_55%)] pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
                <div className="lg:col-span-2">
                  <p className="pj-eyebrow text-brand-accent mb-5">Why Choose Us</p>
                  <h2 className="text-white font-serif font-black tracking-tight leading-[1.05] mb-6"
                      style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)", letterSpacing: "-0.015em" }}>
                    Why PJ Bite is Different
                  </h2>
                  <p className="text-white/65 text-sm sm:text-base font-medium leading-relaxed mb-8 max-w-md">
                    A clean-label promise — sourced from farms we know, processed naturally, sealed with care.
                  </p>
                  <Link href="/about" className="group inline-flex items-center gap-2.5 bg-white text-brand-text text-xs font-black px-7 py-3.5 rounded-full uppercase tracking-[0.25em] hover:bg-brand-accent transition-colors duration-300 shadow-lg">
                    Our Story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {whyPjBite.map((f, i) => (
                    <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500">
                      <div className="w-11 h-11 bg-brand-accent/15 border border-brand-accent/30 rounded-xl flex items-center justify-center shrink-0">
                        <DynIcon name={f.iconName} className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-white mb-1.5 tracking-tight">{f.title}</p>
                        <p className="text-[12.5px] text-white/65 font-medium leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── NATURE'S BENEFITS CAROUSEL ── */}
      <BenefitsCarousel items={dbBenefitProducts} />

      {/* ── QUALITY TRUST SECTION ── */}
      {dbQualityCards.length > 0 && (
        <section className="mt-20 sm:mt-28 bg-gradient-to-b from-brand-bg via-[#EAEEDA] to-brand-bg py-20 px-4 border-y border-brand-primary/15">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-14">
              <p className="pj-eyebrow pj-eyebrow--center mb-4">The PJ Bite Promise</p>
              <h2 className="pj-heading">Crafted with care</h2>
            </div>
            <div className="hidden lg:grid grid-cols-4 gap-7">
              {dbQualityCards.map((card, idx) => {
                const hasReport = Boolean(card.reportUrl);
                const inner = (
                  <>
                    <div className="text-center mb-5">
                      <Sun className="w-6 h-6 text-[#E0D5B5] mx-auto mb-3" />
                      <h3 className="text-[#1A3A20] text-[16px] font-black leading-tight mb-2 drop-shadow-sm">{card.title}</h3>
                      <p className="text-[#4F5E48] text-[11px] font-bold leading-relaxed">{card.desc}</p>
                      {hasReport && (
                        <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-black text-brand-primary uppercase tracking-[0.18em]">
                          View Report <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5 + idx * 0.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
                      className="w-[105%] mt-auto h-52 relative -bottom-2 rounded-t-[20px] overflow-hidden drop-shadow-sm">
                      <Image src={card.img} alt={card.alt || card.title} fill sizes="25vw" className="object-cover object-top scale-100 group-hover:scale-110 transition-transform duration-700" />
                    </motion.div>
                  </>
                );
                const className = "bg-white rounded-3xl overflow-hidden flex flex-col items-center pt-10 px-6 shadow-[0_4px_24px_-12px_rgba(26,32,16,0.1)] border border-[#EAE7DD] group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgba(121,174,111,0.2)]";
                return hasReport ? (
                  <a key={card._id} href={card.reportUrl} target="_blank" rel="noopener noreferrer" className={className}>
                    {inner}
                  </a>
                ) : (
                  <div key={card._id} className={className}>{inner}</div>
                );
              })}
            </div>
            <div className="lg:hidden relative">
              <VerticalQualitySlider cards={dbQualityCards} />
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      {howItWorks.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-14">
              <p className="pj-eyebrow pj-eyebrow--center mb-4">Our Process</p>
              <h2 className="pj-heading-sm">From farm to your doorstep</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 relative">
              <div className="absolute top-9 left-[12.5%] right-[12.5%] h-px border-t border-dashed border-brand-primary/25 hidden sm:block" />
              {howItWorks.map((s, i) => (
                <motion.div key={s.step} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-3 relative">
                  <div className="w-[72px] h-[72px] bg-white border border-brand-primary/20 rounded-full flex items-center justify-center shadow-[0_8px_24px_-12px_rgba(121,174,111,0.4)] relative z-10">
                    <DynIcon name={s.iconName} className="w-7 h-7 text-brand-primary" />
                  </div>
                  <span className="text-[10px] font-black text-brand-accent-dark tracking-[0.3em]">{s.step}</span>
                  <p className="text-sm font-black text-brand-text text-center leading-tight tracking-tight">{s.label}</p>
                  <p className="text-[12px] text-brand-text-muted font-medium text-center leading-snug hidden sm:block">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {dbFaqs.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center mb-10">
              <p className="pj-eyebrow pj-eyebrow--center mb-4">Good to know</p>
              <h2 className="pj-heading-sm">Frequently Asked</h2>
            </div>
            <div className="bg-white rounded-3xl border border-[#EAE7DD] px-7 shadow-[0_4px_24px_-12px_rgba(26,32,16,0.08)]">
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
