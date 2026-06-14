"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Star, Leaf } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Featured", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
  { label: "Top Rated", value: "rating" },
];

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface ProductFiltersProps {
  categories: Category[];
  stockCounts?: { inStock: number; outOfStock: number };
}

function FilterSection({ title, children, defaultOpen = true, onReset, subtext }: { title: string; children: React.ReactNode; defaultOpen?: boolean; onReset?: () => void; subtext?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8E6E1] pb-4 mb-4 relative group">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <span className="text-xs font-black text-brand-text uppercase tracking-wider">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-brand-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-brand-text-muted" />
        )}
      </button>
      <div className={`${open ? "block" : "hidden"}`}>
         {(subtext || onReset) && (
            <div className="flex justify-between items-center mb-4 mt-1">
               <span className="text-[11px] text-brand-text-muted">{subtext}</span>
               {onReset && (
                  <button onClick={onReset} className="text-[11px] text-brand-text hover:text-brand-primary underline transition-colors cursor-pointer z-10 relative">
                     Reset
                  </button>
               )}
            </div>
         )}
        {children}
      </div>
    </div>
  );
}

export default function ProductFilters({ categories, stockCounts }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentMin = searchParams.get("minPrice") || "";
  const currentMax = searchParams.get("maxPrice") || "";
  const currentSearch = searchParams.get("q") || "";
  const currentAvailability = searchParams.get("availability") || "";

  const [minPrice, setMinPrice] = useState(currentMin);
  const [maxPrice, setMaxPrice] = useState(currentMax);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
        // always reset page on filter change
        params.delete("page");
      });
      return params.toString();
    },
    [searchParams]
  );

  const navigate = (updates: Record<string, string | null>) => {
    const qs = createQueryString(updates);
    router.push(pathname + (qs ? `?${qs}` : ""));
  };

  const clearAll = () => {
    router.push(pathname);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters = currentCategory || currentSort || currentMin || currentMax || currentSearch || currentAvailability;

  const FiltersContent = () => (
    <div className="flex flex-col">
      {/* Active Filters / Clear - only on mobile */}
      {hasFilters && (
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">Active Filters</span>
          <button
            onClick={clearAll}
            className="text-xs font-black text-red-500 hover:text-red-600 flex items-center gap-1.5 hover:underline"
          >
            <X className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      )}

      {/* AVAILABILITY */}
      <FilterSection
        title="AVAILABILITY"
        subtext={`${currentAvailability ? 1 : 0} selected`}
        onReset={() => navigate({ availability: null })}
      >
         <div className="flex flex-col gap-3">
            <label
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate({ availability: currentAvailability === "in_stock" ? null : "in_stock" })}
            >
               <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentAvailability === "in_stock" ? "bg-[#164a20] border-[#164a20]" : "border-gray-300 group-hover:border-brand-primary"}`}>
                  {currentAvailability === "in_stock" && <X className="w-2.5 h-2.5 text-white" />}
               </div>
               <span className={`text-xs transition-colors ${currentAvailability === "in_stock" ? "text-brand-primary font-bold" : "text-brand-text-muted group-hover:text-brand-primary"}`}>
                  In stock{typeof stockCounts?.inStock === "number" ? ` (${stockCounts.inStock})` : ""}
               </span>
            </label>
            <label
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate({ availability: currentAvailability === "out_of_stock" ? null : "out_of_stock" })}
            >
               <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentAvailability === "out_of_stock" ? "bg-[#164a20] border-[#164a20]" : "border-gray-300 group-hover:border-brand-primary"}`}>
                  {currentAvailability === "out_of_stock" && <X className="w-2.5 h-2.5 text-white" />}
               </div>
               <span className={`text-xs transition-colors ${currentAvailability === "out_of_stock" ? "text-brand-primary font-bold" : "text-brand-text-muted group-hover:text-brand-primary"}`}>
                  Out of stock{typeof stockCounts?.outOfStock === "number" ? ` (${stockCounts.outOfStock})` : ""}
               </span>
            </label>
         </div>
      </FilterSection>

      {/* PRICE */}
      <FilterSection 
         title="PRICE" 
         subtext="The highest price is ₹ 1,294.00" 
         onReset={() => navigate({ minPrice: null, maxPrice: null })}
      >
        <div className="flex items-center gap-4">
            <div className="relative flex-1">
               <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">₹</span>
               <input
                 type="number"
                 min={0}
                 placeholder="0"
                 value={minPrice}
                 onChange={(e) => setMinPrice(e.target.value)}
                 onBlur={() => navigate({ minPrice: minPrice || null })}
                 className="w-full pl-6 pr-2 py-2 text-xs font-medium text-brand-text bg-white border border-[#E8E6E1] rounded-lg focus:outline-none focus:border-brand-primary transition-colors"
               />
            </div>
            <span className="text-brand-text-muted text-xs">-</span>
            <div className="relative flex-1">
               <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">₹</span>
               <input
                 type="number"
                 min={0}
                 placeholder="1294.00"
                 value={maxPrice}
                 onChange={(e) => setMaxPrice(e.target.value)}
                 onBlur={() => navigate({ maxPrice: maxPrice || null })}
                 className="w-full pl-6 pr-2 py-2 text-xs font-medium text-brand-text bg-white border border-[#E8E6E1] rounded-lg focus:outline-none focus:border-brand-primary transition-colors"
               />
            </div>
        </div>
      </FilterSection>

      {/* BRAND / CATEGORIES */}
      <FilterSection 
         title="BRAND" 
         subtext={`${currentCategory ? 1 : 0} selected`}
         onReset={() => navigate({ category: null })}
      >
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((cat) => (
             <label key={cat._id} className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate({ category: currentCategory === cat.slug ? null : cat.slug })}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentCategory === cat.slug ? "bg-[#164a20] border-[#164a20]" : "border-gray-300 group-hover:border-brand-primary"}`}>
                   {currentCategory === cat.slug && <X className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`text-xs transition-colors ${currentCategory === cat.slug ? "text-brand-primary font-bold" : "text-brand-text-muted group-hover:text-brand-primary"}`}>
                   {cat.name}
                </span>
             </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 bg-white border border-[#E8E6E1] rounded-xl text-sm font-black text-brand-text premium-shadow hover:border-brand-primary/30 hover:text-brand-primary transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="w-5 h-5 bg-brand-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {[currentCategory, currentSort, currentMin, currentMax, currentSearch, currentAvailability].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E6E1] sticky top-0 bg-white z-10">
              <h3 className="text-base font-black text-brand-text uppercase tracking-widest">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 bg-brand-bg rounded-xl border border-[#E8E6E1] text-brand-text hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              <FiltersContent />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[#E8E6E1] px-6 py-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-3.5 bg-brand-primary text-white font-black rounded-xl uppercase tracking-widest text-sm shadow-lg shadow-brand-primary/25"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (No border box, just bare layout as per screenshot) */}
      <div className="hidden lg:block w-full">
         <div className="pr-4">
            <FiltersContent />
         </div>
      </div>
    </>
  );
}
