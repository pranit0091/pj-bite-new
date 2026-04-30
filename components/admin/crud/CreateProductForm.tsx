"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import CloudinaryUpload from "@/components/ui/CloudinaryUpload";
import { createProduct } from "@/app/actions/admin";
import { showToast } from "@/lib/swal";
import { useRouter } from "next/navigation";

interface Category {
  _id: string;
  name: string;
}

interface Variant {
  _id?: string;
  name: string;
  price: number | string;
  stock: number | string;
}

const DEFAULT_CLAIMS = [
  "No Added Sugar",
  "No Preservatives",
  "Packed with Goodness",
  "With Natural Farming",
];

export default function CreateProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [claims, setClaims] = useState<string[]>(DEFAULT_CLAIMS);
  const [heroHighlights, setHeroHighlights] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", price: "", stock: "" }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof Omit<Variant, "_id">,
    value: string | number
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const validate = (): boolean => {
    if (variants.some((v) => !v.name.trim())) {
      showToast("All variant names are required", "error");
      return false;
    }
    if (variants.some((v) => Number(v.price) <= 0)) {
      showToast("All variant prices must be greater than 0", "error");
      return false;
    }
    if (variants.some((v) => Number(v.stock) < 0)) {
      showToast("Variant stock cannot be negative", "error");
      return false;
    }
    if (claims.some((c) => !c.trim())) {
      showToast("Remove empty claims or fill them in", "error");
      return false;
    }
    if (heroHighlights.some((h) => !h.trim())) {
      showToast("Remove empty hero highlights or fill them in", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("variants", JSON.stringify(variants));
      formData.append("claims", JSON.stringify(claims));
      formData.append("heroHighlights", JSON.stringify(heroHighlights));

      await createProduct(formData);

      showToast("Product created successfully!", "success");
      formRef.current?.reset();
      setVariants([]);
      setClaims(DEFAULT_CLAIMS);
      setHeroHighlights([]);
      setUploadKey((prev) => prev + 1);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input
          type="text"
          name="name"
          required
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          name="categoryId"
          required
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <label className="block text-sm font-bold text-gray-900 mb-3">Inventory & Pricing</label>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Base Price (₹)</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Base Stock</label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              defaultValue="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500">
              Variant-Specific Stock & Prices
            </label>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-xs text-brand-primary font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3 h-3" /> Add Size/Variant
            </button>
          </div>

          {variants.length === 0 && (
            <p className="text-xs text-gray-400 italic">No variants active. Using base stock/price.</p>
          )}

          {variants.map((variant, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Size (e.g. 500g)"
                value={variant.name}
                onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                required
              />
              <input
                type="number"
                placeholder="Price"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                className="w-20 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                min="0"
                value={variant.stock}
                onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                className="w-20 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveVariant(idx)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
        <CloudinaryUpload key={uploadKey} name="images" maxFiles={5} />
      </div>

      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
        <label className="block text-[13px] font-bold text-amber-900 border-l-4 border-amber-500 pl-2 mb-1">
          Product Description Banners
        </label>
        <p className="text-[11px] text-amber-700/80 mb-3 ml-3">
          Optional. Upload stacked infographics here to replace standard text layout on the product page.
        </p>
        <CloudinaryUpload key={`${uploadKey}-desc`} name="descriptionImages" maxFiles={10} />
      </div>

      <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-6">
        <label className="block text-sm font-bold text-gray-900 border-l-4 border-brand-primary pl-2">
          Dynamic Storefront Presentation
        </label>

        {/* Claims */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
              Product Features (Claims)
            </label>
            <button
              type="button"
              onClick={() => setClaims([...claims, ""])}
              className="text-xs text-brand-primary font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3 h-3" /> Add Feature
            </button>
          </div>
          <div className="space-y-2">
            {claims.map((claim, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={claim}
                  onChange={(e) => {
                    const c = [...claims];
                    c[idx] = e.target.value;
                    setClaims(c);
                  }}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="e.g. No Added Sugar"
                  required
                />
                <button
                  type="button"
                  onClick={() => setClaims(claims.filter((_, i) => i !== idx))}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Highlights */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
              Slider Subtitles (Hero Highlights)
            </label>
            <button
              type="button"
              onClick={() => setHeroHighlights([...heroHighlights, ""])}
              className="text-xs text-brand-primary font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3 h-3" /> Add Subtitle
            </button>
          </div>
          <div className="space-y-2">
            {heroHighlights.length === 0 && (
              <p className="text-xs text-gray-400 italic">
                No custom subtitles. Will fallback to Product Name.
              </p>
            )}
            {heroHighlights.map((hh, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={hh}
                  onChange={(e) => {
                    const h = [...heroHighlights];
                    h[idx] = e.target.value;
                    setHeroHighlights(h);
                  }}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="e.g. Wholesome Nutrition in Every Bite"
                  required
                />
                <button
                  type="button"
                  onClick={() => setHeroHighlights(heroHighlights.filter((_, i) => i !== idx))}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-4">
        <label className="block text-sm font-bold text-gray-900 border-l-4 border-gray-900 pl-2">
          Product Rich Metadata (Optional)
        </label>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Ingredients Log
          </label>
          <textarea
            name="ingredients"
            placeholder="e.g. 100% Organic Almonds, Sea Salt..."
            rows={2}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Nutritional Information
          </label>
          <textarea
            name="nutrition"
            placeholder="e.g. Calories: 576kcal, Protein: 21g, Fat: 49g, Carbs: 22g..."
            rows={2}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Health Benefits
          </label>
          <textarea
            name="benefits"
            placeholder="e.g. Rich in Vitamin E, Supports Brain Health, Keto Friendly..."
            rows={2}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Creating...
          </>
        ) : (
          "Add Product"
        )}
      </button>
    </form>
  );
}