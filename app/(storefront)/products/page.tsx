import Link from "next/link";
import { ArrowRight, Star, SlidersHorizontal, Leaf, Search, ChevronDown, ChevronRight, Grid3x3, List, ShoppingBag, Eye, Lock } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductFilters from "@/components/products/ProductFilters";
import { Suspense } from "react";
import { Banner } from "@/models/Banner";

import ProductGridCard from "@/components/products/ProductGridCard";

export const revalidate = 0;

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}

async function getProducts(params: SearchParams) {
  await dbConnect();

  const query: Record<string, any> = {};

  if (params.q?.trim()) {
    query.$or = [
      { name: { $regex: params.q.trim(), $options: "i" } },
      { description: { $regex: params.q.trim(), $options: "i" } },
    ];
  }

  if (params.category) {
    const cat = await Category.findOne({ slug: params.category }).select("_id").lean();
    if (cat) {
      query.categoryId = (cat as any)._id;
    } else {
      return { products: [], categories: [] };
    }
  }

  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) query.price.$gte = parseFloat(params.minPrice);
    if (params.maxPrice) query.price.$lte = parseFloat(params.maxPrice);
  }

  let sortOption: Record<string, any> = { createdAt: -1 };
  if (params.sort === "price_asc") sortOption = { price: 1 };
  else if (params.sort === "price_desc") sortOption = { price: -1 };
  else if (params.sort === "popular") sortOption = { isFeatured: -1, createdAt: -1 };

  const [productsRaw, categoriesRaw] = await Promise.all([
    Product.find(query)
      .populate("categoryId", "name slug")
      .sort(sortOption)
      .lean(),
    Category.find({}).lean(),
  ]);

  const products = JSON.parse(JSON.stringify(productsRaw));
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  return { products, categories };
}

export default async function ProductsListingPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { products, categories } = await getProducts(searchParams);
  
  const hasFilters = searchParams.q || searchParams.category || searchParams.sort || searchParams.minPrice || searchParams.maxPrice;
  const activeCat = (categories as any[]).find((c: any) => c.slug === searchParams.category);

  // Group categories for the left sidebar (like Nutraj's "Shop By Collection")
  const catGroups = [
    { label: "Nuts", slugs: ["nuts", "cashews", "almonds", "walnuts", "pistachios", "peanuts"] },
    { label: "Dry Fruits", slugs: ["dry-fruits", "raisins", "dates", "figs", "apricots"] },
    { label: "Seeds", slugs: ["seeds", "chia", "flaxseeds", "pumpkin-seeds", "sunflower-seeds"] },
    { label: "Mixes", slugs: ["mixes", "trail-mix", "premium-mix"] },
    { label: "Healthy Snacks", slugs: ["snacks", "chips", "bars"] },
  ];

  return (
    <div className="bg-brand-bg min-h-screen pb-24 lg:pb-8">

      {/* ── Premium Page Header ── */}
      <section className="relative pt-14 pb-10 sm:pt-20 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#EAE7DD]/70">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[10px] font-bold text-brand-text-muted mb-6 uppercase tracking-[0.25em]">
            <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-brand-text">{activeCat ? activeCat.name : "All Products"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-brand-primary uppercase tracking-[0.45em] mb-3">
                {searchParams.q ? "Search results" : activeCat ? "Collection" : "The full edit"}
              </p>
              <h1 className="font-serif font-black text-brand-text leading-[1.05] tracking-tight"
                  style={{ fontSize: "clamp(2rem, 4.2vw, 3.25rem)", letterSpacing: "-0.02em" }}>
                {searchParams.q ? <>Results for &ldquo;<span className="text-brand-primary">{searchParams.q}</span>&rdquo;</> :
                 activeCat ? activeCat.name : "All Products"}
              </h1>
              <p className="text-sm sm:text-base text-brand-text-muted font-medium mt-3 max-w-xl">
                {activeCat ? `${products.length} hand-picked products in this collection.` : `${products.length} naturally preserved selections from our farm partners.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 pt-8">

        {/* ── Main Layout ── */}
        <div className="flex gap-6 items-start mt-2">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-28">
            <Suspense fallback={null}>
              <ProductFilters categories={(categories as any[]).map((c: any) => ({ ...c, _id: c._id.toString() }))} />
            </Suspense>
          </aside>

          {/* ── PRODUCTS GRID ── */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar (Grid/List, Count, Sort) */}
            <div className="flex items-center justify-between bg-white border border-[#EAE7DD] px-4 py-3 sm:px-5 sm:py-4 rounded-2xl mb-7 shadow-[0_2px_12px_-4px_rgba(26,32,16,0.06)]">
               <div className="hidden sm:flex items-center gap-3 text-brand-primary">
                  <button aria-label="Grid view" className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button aria-label="List view" className="w-9 h-9 rounded-lg hover:bg-brand-bg flex items-center justify-center text-brand-text-muted hover:text-brand-primary transition-colors">
                    <List className="w-4 h-4" />
                  </button>
               </div>
               <div className="text-[10px] sm:text-[11px] font-black text-brand-text-muted uppercase tracking-[0.3em] text-center sm:text-left flex-1 sm:flex-none">
                 {products.length} {products.length === 1 ? "Product" : "Products"}
               </div>
               <div className="flex items-center gap-3 text-[11px] text-brand-text font-bold">
                 <span className="hidden sm:block text-brand-text-muted uppercase tracking-[0.25em] text-[10px]">Sort</span>
                 <select className="border border-[#EAE7DD] rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-white outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 cursor-pointer text-brand-text text-[12px] font-bold transition-colors">
                   <option>Alphabetically, A-Z</option>
                   <option>Price, Low to High</option>
                   <option>Price, High to Low</option>
                   <option>Featured</option>
                 </select>
               </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-[#EAE7DD] shadow-[0_4px_24px_-12px_rgba(26,32,16,0.06)]">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-bg flex items-center justify-center border border-brand-primary/20">
                  <Leaf className="w-7 h-7 text-brand-primary/60" />
                </div>
                <h3 className="font-serif font-black text-brand-text text-2xl mb-3 tracking-tight">No products found</h3>
                <p className="text-sm text-brand-text-muted font-medium mb-7 max-w-sm mx-auto">
                  {searchParams.q ? <>Nothing matches &ldquo;<span className="text-brand-text font-bold">{searchParams.q}</span>&rdquo; — try a broader search.</> : "Try clearing your filters to see everything."}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-brand-primary text-white font-black px-7 py-3 rounded-full text-[11px] uppercase tracking-[0.25em] hover:bg-brand-primary-dark transition-colors shadow-[0_10px_24px_-8px_rgba(121,174,111,0.5)]"
                >
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {(products as any[]).map((prod: any) => (
                  <ProductGridCard key={prod._id.toString()} prod={prod} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── FAQ Section ── */}
        {!hasFilters && (
          <div className="mt-24 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center mb-10">
              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.45em] mb-3">Good to know</p>
              <h2 className="font-serif font-black text-brand-text leading-tight" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.015em" }}>
                Frequently Asked
              </h2>
            </div>
            <div className="bg-white rounded-3xl border border-[#EAE7DD] px-7 shadow-[0_4px_24px_-12px_rgba(26,32,16,0.08)] divide-y divide-[#EAE7DD]">
              {[
                { q: "How many dry fruits should I eat in a day?", a: "A small handful (30g) of mixed dry fruits per day is optimal for most adults." },
                { q: "Which dry fruit is best for weight loss?", a: "Almonds, walnuts, and dates in moderation can support weight management due to their fiber and protein content." },
                { q: "Which dry fruit is good for skin?", a: "Walnuts (Omega-3), almonds (Vitamin E), and figs are excellent for glowing skin." },
                { q: "Which dry fruit is good for hair?", a: "Almonds, walnuts, and cashews are rich in biotin and zinc which promote hair growth." },
                { q: "Can we eat dry fruits in fast?", a: "Yes! Most dry fruits like almonds, walnuts, and raisins are considered satvik and suitable for fasting." },
              ].map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between py-4 cursor-pointer text-sm font-bold text-brand-text list-none">
                    {faq.q}
                    <ChevronDown className="w-4 h-4 text-brand-text-muted group-open:rotate-180 transition-transform shrink-0 ml-2" />
                  </summary>
                  <p className="text-sm text-brand-text-muted font-medium pb-4 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Bottom Nav (spacer) ── */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
