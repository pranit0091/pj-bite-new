"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu, X, ShoppingBag, UserCircle, LogOut, LayoutDashboard,
  Settings, ChevronDown, Leaf, Search, Phone, MapPin,
  Home, Grid3x3, BookOpen, Info, Mail, Star, Package,
  ChevronRight, Heart, ArrowRight, Loader2, Mic
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS_LEFT = [
  { name: "Home",      href: "/",        icon: Home },
  { name: "Shop",      href: "/products", icon: Package },
];
const NAV_LINKS_RIGHT = [
  { name: "Journal",  href: "/blogs",    icon: BookOpen },
  { name: "About Us", href: "/about",    icon: Info },
  { name: "Careers",  href: "/careers",  icon: Star },
  { name: "Contact",  href: "/contact",  icon: Mail },
];

// Premium claims — inspired by organictattva.com
const MARQUEE_CLAIMS = [
  "🌿 100% NATURAL",
  "🚚 FREE SHIPPING ₹499+",
  "🚫 NO COLOUR ADDED",
  "🍬 NO ADDED SUGAR",
  "⚗️ NO CHEMICAL",
  "🌸 NO FLAVOUR",
  "🌾 FARM DIRECT SOURCING",
  "✨ PREMIUM DRY FRUITS & NUTS",
  "🔬 LAB TESTED EVERY BATCH",
];

// Fallback animated search placeholder terms
const SEARCH_PLACEHOLDERS = [
  "Walnuts",
  "Almonds",
  "Cashews",
  "Dried Mango",
  "Mixed Fruits",
  "Dates",
];

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  categoryId?: { name: string };
}

// ── Inline Animated Search Bar ─────────────────────────────────────────────
function InlineSearch({ categories = [], autoFocus = false }: { categories?: any[]; autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => { inputRef.current?.focus(); setFocused(true); }, 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  // Cycle placeholder text
  const dynamicPlaceholders = categories.length > 0 
    ? categories.map(c => `Search For ${c.name}`)
    : SEARCH_PLACEHOLDERS.map(p => `Search For ${p}`);

  useEffect(() => {
    if (dynamicPlaceholders.length === 0) return;
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % dynamicPlaceholders.length);
    }, 2200);
    return () => clearInterval(t);
  }, [dynamicPlaceholders.length]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults((data.products || []).slice(0, 6));
      }
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(val), 280);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      fetchResults(transcript);
      // Auto-submit after a small delay
      setTimeout(() => {
        router.push(`/products?q=${encodeURIComponent(transcript)}`);
        setFocused(false);
      }, 600);
    };

    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setFocused(false);
      setQuery("");
      setResults([]);
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const showDropdown = focused && (results.length > 0 || (query.trim().length >= 2 && !loading));

  return (
    <div ref={wrapRef} className="relative flex-1 w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 ${
            focused
              ? "bg-white border-brand-primary shadow-[0_0_0_3px_rgba(26,58,32,0.12)]"
              : "bg-[#f5f2ec] border-transparent hover:border-brand-primary/30"
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-brand-primary animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-brand-primary shrink-0" />
          )}

          <div className="relative flex-1 overflow-hidden h-5">
            {/* Animated placeholder */}
            {!query && !focused && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIdx}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 text-sm font-semibold text-brand-text-muted pointer-events-none flex items-center"
                >
                  {dynamicPlaceholders[placeholderIdx]}
                </motion.span>
              </AnimatePresence>
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              placeholder={focused ? "Search products…" : ""}
              className="w-full h-full bg-transparent outline-none text-sm font-semibold text-brand-text relative z-10"
            />
          </div>

          {query ? (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
              className="text-brand-text-muted hover:text-brand-primary transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              {/* Mic Icon for Voice Search */}
              <button
                 type="button"
                 onClick={handleVoiceSearch}
                 className={`p-1.5 rounded-full transition-all duration-300 ${
                   isListening 
                     ? "bg-red-500 text-white animate-pulse" 
                     : "text-brand-primary/60 hover:text-brand-primary hover:bg-brand-primary/5"
                 }`}
                 title="Search by voice"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Dropdown results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl shadow-brand-primary/10 z-[200] overflow-hidden"
          >
            {results.length > 0 ? (
              <>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-[0.2em]">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="px-2 pb-2 flex flex-col gap-0.5 max-h-64 overflow-y-auto no-scrollbar">
                  {results.map((p) => (
                    <Link
                      key={p._id}
                      href={`/products/${p.slug}`}
                      onClick={() => { setFocused(false); setQuery(""); setResults([]); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-primary/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#f5f2ec] border border-[#E8E6E1] flex items-center justify-center overflow-hidden shrink-0">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Leaf className="w-4 h-4 text-brand-text-muted/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-brand-text truncate group-hover:text-brand-primary transition-colors">{p.name}</p>
                        {p.categoryId?.name && (
                          <p className="text-[10px] text-brand-text-muted font-medium">{p.categoryId.name}</p>
                        )}
                      </div>
                      <p className="text-sm font-black text-brand-primary shrink-0">₹{p.price}</p>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[#F0EDE8] px-4 py-3">
                  <button
                    onClick={() => { setFocused(false); setQuery(""); router.push(`/products?q=${encodeURIComponent(query)}`); }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-black text-brand-primary hover:underline uppercase tracking-widest"
                  >
                    View all results for "{query}" <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              <div className="px-5 py-8 text-center">
                <Search className="w-8 h-8 text-brand-text-muted/30 mx-auto mb-2" />
                <p className="text-sm font-bold text-brand-text">No results for "{query}"</p>
                <p className="text-xs text-brand-text-muted font-medium mt-1">Try a different search term.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Navbar ─────────────────────────────────────────────────────────────
export default function Navbar({
  user,
  categories = [],
  marqueeItems = MARQUEE_CLAIMS,
}: {
  user?: any;
  categories?: any[];
  marqueeItems?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const pathname = usePathname();
  const openCart = useCartStore((s) => s.openCart);
  const openAuthModal = useCartStore((s) => s.openAuthModal);
  const items = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCartCount(items.reduce((a, i) => a + i.quantity, 0));
    setWishlistCount(wishlistItems.length);
  }, [items, wishlistItems]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md shadow-black/5 border-b border-[#E8E6E1]"
            : "bg-white border-b border-[#E8E6E1]"
        }`}
      >
        {/* ── Marquee Claims Strip — collapses on scroll ── */}
        {marqueeItems.length > 0 && (
        <motion.div
          animate={{ height: scrolled ? 0 : "auto" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-brand-primary overflow-hidden"
        >
          <div className="py-2">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...marqueeItems, ...marqueeItems].map((t, i) => (
                <span key={i} className="mx-6 text-white text-[11px] font-black tracking-widest uppercase">
                  {t} &nbsp;•
                </span>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* ── Main Nav Row ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-bg transition-colors"
            >
              <Menu className="w-6 h-6 text-brand-text" />
            </button>

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center shrink-0 mx-auto lg:mx-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <Image
                  src="/navbarlogo.png"
                  alt="PJ Bite"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_LINKS_LEFT.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2.5 text-sm font-bold rounded-full transition-all ${
                    isActive(link.href)
                      ? "text-brand-primary"
                      : "text-brand-text hover:text-brand-primary"
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-primary rounded-full"
                    />
                  )}
                </Link>
              ))}

              {NAV_LINKS_RIGHT.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2.5 text-sm font-bold rounded-full transition-all ${
                    isActive(link.href)
                      ? "text-brand-primary"
                      : "text-brand-text hover:text-brand-primary"
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Right icons ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 sm:p-2.5 hover:bg-brand-bg rounded-xl transition-colors group"
              >
                <Heart className="w-5 h-5 sm:w-5 sm:h-5 text-brand-text group-hover:text-rose-500 transition-colors" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.5 }}
                      className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white"
                    >
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 sm:p-2.5 hover:bg-brand-bg rounded-xl transition-colors group"
              >
                <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5 text-brand-text group-hover:text-brand-primary transition-colors" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.5 }}
                      className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-brand-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-brand-bg rounded-full transition-all"
                    >
                      {user.image ? (
                        <Image src={user.image} alt="" width={28} height={28} className="w-7 h-7 rounded-full ring-2 ring-brand-primary/20 object-cover" />
                      ) : (
                        <div className="w-7 h-7 bg-gradient-to-br from-brand-primary to-[#164a20] rounded-full flex items-center justify-center text-white font-black text-xs">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="text-sm font-bold text-brand-text hidden lg:block">{user.name?.split(" ")[0]}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-brand-text-muted transition-transform hidden lg:block ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl shadow-brand-primary/10 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-[#F0EDE8] mb-1">
                            <p className="text-sm font-black text-brand-text truncate">{user.name}</p>
                            <p className="text-xs text-brand-text-muted truncate mt-0.5">{user.email}</p>
                          </div>
                          <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-brand-text hover:text-brand-primary hover:bg-brand-primary/5 transition-colors mx-2 rounded-xl">
                            <LayoutDashboard className="w-4 h-4" /> My Dashboard
                          </Link>
                          {(user.role === "SUPERADMIN" || user.role === "VENDOR") && (
                            <Link href="/admin/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50 transition-colors mx-2 rounded-xl">
                              <Settings className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <div className="h-px bg-[#F0EDE8] my-1.5 mx-3" />
                          <button
                            onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                            className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors mx-2 rounded-xl"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <p className="hidden lg:block text-[8px] font-bold text-brand-text-muted italic opacity-70 px-1 whitespace-nowrap">
                      Every bite carries the essence of real farming
                    </p>
                    <button
                      onClick={() => openAuthModal()}
                      className="flex items-center gap-1.5 bg-brand-primary hover:bg-[#164a20] text-white px-4 py-2 rounded-full font-black text-sm transition-all shadow-md shadow-brand-primary/20 hover:-translate-y-0.5"
                    >
                      <UserCircle className="w-4 h-4" /> Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Persistent Search Bar Row — collapses on scroll ── */}
        <motion.div
          animate={{ height: scrolled ? 0 : "auto", opacity: scrolled ? 0 : 1 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden border-t border-[#F0EDE8] bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <InlineSearch categories={categories} />
          </div>
        </motion.div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 bottom-0 z-[60] w-[82vw] max-w-[320px] bg-white shadow-2xl flex flex-col lg:hidden"
            >
              <div className="bg-brand-primary px-5 pt-5 pb-5">
                <div className="flex items-center justify-between mb-4">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-2">
                      {/* Mini logo circle in drawer */}
                      <div className="relative w-9 h-9 bg-white rounded-full flex items-center justify-center ring-2 ring-[#D4A017]">
                        <div className="relative w-7 h-7">
                          <Image src="/navbarlogo.png" alt="PJ Bite" fill className="object-contain" />
                        </div>
                      </div>
                      <span className="text-white font-black text-base tracking-widest">PJ BITE</span>
                    </div>
                  </Link>
                  <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {user ? (
                  <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                    {user.image ? (
                      <Image src={user.image} alt="" width={40} height={40} className="w-10 h-10 rounded-full ring-2 ring-white/40 object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-black">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-white/70 truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-bold text-white/70 italic text-center px-2">
                      "Every bite carries the essence of real farming"
                    </p>
                    <button
                      onClick={() => { setIsOpen(false); openAuthModal(); }}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-white text-brand-primary font-black text-sm rounded-2xl"
                    >
                      <UserCircle className="w-4 h-4" /> Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile search */}
              <div className="px-4 py-3 border-b border-[#F0EDE8]">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const q = (fd.get("q") as string)?.trim();
                  if (q) { setIsOpen(false); window.location.href = `/products?q=${encodeURIComponent(q)}`; }
                }}>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#f5f2ec] rounded-full border border-transparent focus-within:border-brand-primary focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-brand-primary shrink-0" />
                    <input name="q" type="text" placeholder="Search products…" className="flex-1 bg-transparent outline-none text-sm font-semibold text-brand-text placeholder:text-brand-text-muted/60" />
                  </div>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-3">
                  {[...NAV_LINKS_LEFT, ...NAV_LINKS_RIGHT].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl ${
                        isActive(link.href) ? "text-brand-primary bg-brand-primary/8" : "text-brand-text-muted"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  ))}

                  {categories.length > 0 && (
                    <>
                      <div className="px-4 pt-4 pb-1">
                        <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Categories</p>
                      </div>
                      {categories.map((cat: any) => (
                        <Link
                          key={cat._id}
                          href={`/products?category=${cat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-brand-text-muted hover:text-brand-primary rounded-xl transition-all"
                        >
                          {cat.image ? (
                            <Image src={cat.image} alt="" width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <Leaf className="w-4 h-4 text-brand-text-muted/50" />
                          )}
                          {cat.name}
                        </Link>
                      ))}
                    </>
                  )}

                  {/* ── User Actions (Mobile) ── */}
                  {user && (
                    <div className="mt-4 pt-4 border-t border-[#F0EDE8] space-y-1">
                      <div className="px-4 pb-1">
                        <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Account Actions</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" /> My Dashboard
                      </Link>

                      {(user.role === "SUPERADMIN" || user.role === "VENDOR") && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-50 rounded-xl transition-all"
                        >
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer — matches actual header height */}
      <div style={{ height: headerHeight }} />
    </>
  );
}