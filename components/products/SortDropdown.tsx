"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_OPTIONS = [
  { label: "Alphabetically, A-Z", value: "name_asc" },
  { label: "Alphabetically, Z-A", value: "name_desc" },
  { label: "Price, Low to High",  value: "price_asc" },
  { label: "Price, High to Low",  value: "price_desc" },
  { label: "Featured",            value: "popular" },
];

export default function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "name_asc";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;
    if (value && value !== "name_asc") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    const qs = params.toString();
    router.push(pathname + (qs ? `?${qs}` : ""));
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border border-[#EAE7DD] rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-white outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 cursor-pointer text-brand-text text-[12px] font-bold transition-colors"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
