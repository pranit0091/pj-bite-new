"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ShoppingCart, PackageCheck, Heart } from "lucide-react";
import { showSuccess, showError, showToast } from "@/lib/swal";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ProductActionButtonsProps {
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images?: string[];
    vendorId: string;
    slug?: string;
    variants?: { _id?: string; name: string; price: number }[];
  };
}

export default function ProductActionButtons({ product }: ProductActionButtonsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlistStore();
  const { status } = useSession();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const dbVariants = product.variants || [];
  const [activeVariant, setActiveVariant] = useState<any>(
    dbVariants.length > 0 ? dbVariants[0] : null
  );

  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentStock = activeVariant 
    ? (activeVariant.stock ?? 0) 
    : (product as any).stock ?? 0;
  
  const wishlisted = isWishlisted(product._id);
  const isOutOfStock = currentStock <= 0;

  const setBuyNowItem = useCartStore((state) => state.setBuyNowItem);
  const openCheckout = useCartStore((state) => state.openCheckout);
  const openAuthModal = useCartStore((state) => state.openAuthModal);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addItem({
      id: product._id.toString(),
      variantId: activeVariant?._id?.toString(),
      name: activeVariant ? `${product.name} - ${activeVariant.name}` : product.name,
      price: currentPrice,
      image: product.images?.[0] || "",
      vendorId: product.vendorId.toString(),
    }, quantity);
    
    return true;
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    
    if (status !== "authenticated") {
      showToast("Sign in to complete your purchase! 💚");
      openAuthModal();
      return;
    }
    
    setBuyNowItem({
      id: product._id.toString(),
      variantId: activeVariant?._id?.toString(),
      name: activeVariant ? `${product.name} - ${activeVariant.name}` : product.name,
      price: currentPrice,
      image: product.images?.[0] || "",
      vendorId: product.vendorId.toString(),
      quantity: quantity,
    });
    
    openCheckout();
  };

  const handleWishlistToggle = async () => {
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        // Optimistic remove
        removeFromWishlist(product._id);
        showToast("Removed from wishlist");
        if (status === "authenticated") {
          await fetch("/api/wishlist", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product._id }),
          });
        }
      } else {
        // Optimistic add
        addToWishlist({
          _id: product._id,
          name: product.name,
          slug: product.slug || product._id,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images,
        });
        showToast("Added to wishlist! 💚");
        if (status === "authenticated") {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product._id }),
          });
        }
      }
    } catch {
      showError("Something went wrong", "Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Dynamic Visual Variants */}
      {dbVariants.length > 0 && (
        <div className="pb-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-text mb-3">Select Size Variant</label>
          <div className="flex flex-wrap items-center gap-3">
            {dbVariants.map((v: any) => {
              const variantStock = v.stock ?? 0;
              return (
              <button
                key={v.name}
                onClick={() => {
                  setActiveVariant(v);
                  if (quantity > variantStock && variantStock > 0) setQuantity(variantStock);
                  if (variantStock === 0) setQuantity(0);
                  if (variantStock > 0 && quantity === 0) setQuantity(1);
                }}
                className={`flex-1 min-w-[100px] text-center px-4 py-3 text-xs font-bold tracking-wider rounded-xl border-2 transition-all duration-300 ${
                  activeVariant?.name === v.name
                    ? 'border-brand-primary bg-brand-primary text-white premium-shadow scale-[1.02]'
                    : variantStock === 0 
                      ? 'border-[#F8F8F8] bg-[#F8F8F8] text-gray-300 cursor-not-allowed opacity-60'
                      : 'border-[#E8E6E1] text-brand-text-muted hover:border-brand-primary/40 hover:text-brand-text bg-[#fbfbfb]'
                }`}
              >
                {v.name}
                {variantStock === 0 && <span className="block text-[8px] mt-0.5 opacity-60">(Out)</span>}
              </button>
            )})}
          </div>
        </div>
      )}

      {/* Stock Status Indicator */}
      <div className="flex items-center gap-2 px-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-emerald-500"} animate-pulse`} />
        <p className={`text-[10px] font-black uppercase tracking-widest ${isOutOfStock ? "text-red-500" : "text-emerald-600"}`}>
          {isOutOfStock ? "Out of Stock" : `In Stock (${currentStock} available)`}
        </p>
      </div>

      {/* Buy Now & Add to Cart Buttons */}
      <div className="flex flex-col gap-3">
        {/* Quantity and Share are separate lines, or we keep quantity on top */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <div className={`flex-shrink-0 ${isOutOfStock ? "opacity-50 pointer-events-none" : ""}`}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-2">Quantity</label>
            <div className="inline-flex flex-row items-center bg-[#fbfbfb] border border-[#E8E6E1] rounded-xl overflow-hidden h-14">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock}
                className="px-5 h-full text-brand-text-muted hover:text-brand-primary hover:bg-brand-bg transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center text-xs text-brand-text font-black">{isOutOfStock ? 0 : quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={isOutOfStock || quantity >= currentStock}
                className="px-5 h-full text-brand-text-muted hover:text-brand-primary hover:bg-brand-bg transition-colors disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            {/* Add to Cart */}
            <button
              onClick={() => {
                const success = handleAddToCart();
                if (success) {
                  showSuccess("Added to Cart!", `${activeVariant ? activeVariant.name : product.name} is now in your cart.`);
                }
              }}
              disabled={isOutOfStock}
              className={`h-14 px-6 text-[11px] font-black tracking-widest uppercase rounded-xl transition-all premium-shadow flex items-center justify-center gap-3 group ${
                isOutOfStock 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                  : "border-2 border-brand-text text-brand-text bg-white hover:bg-brand-bg hover:-translate-y-0.5"
              }`}
            >
              {isOutOfStock ? "Sold Out" : (
                <>
                  <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Cart
                </>
              )}
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`h-14 px-6 text-[11px] font-black tracking-widest uppercase rounded-xl transition-all premium-shadow flex items-center justify-center gap-3 group ${
                isOutOfStock 
                  ? "hidden"
                  : "bg-brand-accent text-brand-text hover:bg-brand-accent-dark hover:-translate-y-0.5"
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Add to Wishlist */}
      <button
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        className={`w-full h-14 rounded-xl border-2 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 group ${
          wishlisted
            ? "border-rose-400 bg-rose-50 text-rose-500 hover:bg-rose-100"
            : "border-[#E8E6E1] bg-white text-brand-text-muted hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={wishlisted ? "filled" : "empty"}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${wishlisted ? "fill-rose-400 text-rose-400" : "group-hover:text-rose-400"}`}
            />
          </motion.span>
        </AnimatePresence>
        {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>

      {/* Dispatch Info */}
      <div className="pt-2">
        <div className="flex items-start gap-4 p-4 bg-[#fbfbfb] rounded-xl border border-[#E8E6E1]/60">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
            <PackageCheck className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="pt-0.5">
            <p className="text-[13px] font-medium text-brand-text-muted leading-tight">Secure Dispatch from <strong className="font-bold text-brand-text">Premium Hub</strong></p>
            <p className="text-[11px] font-bold tracking-wider uppercase text-emerald-600 mt-1">Leaves warehouse in 24 hrs</p>
          </div>
        </div>
      </div>

    </div>
  );
}
