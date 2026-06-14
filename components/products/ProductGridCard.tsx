"use client";

import Link from "next/link";
import { Star, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { showSuccess, showToast, showError } from "@/lib/swal";
import { useSession } from "next-auth/react";

interface ProductGridCardProps {
  prod: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images?: string[];
    vendorId: string;
    stock: number;
    categoryId?: {
      name: string;
    };
  };
}

export default function ProductGridCard({ prod }: ProductGridCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const setBuyNowItem = useCartStore((state) => state.setBuyNowItem);
  const openCheckout = useCartStore((state) => state.openCheckout);
  const openAuthModal = useCartStore((state) => state.openAuthModal);
  const { status } = useSession();

  const discount = prod.originalPrice && prod.originalPrice > prod.price
    ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
    : 0;
    
  const img = prod.images?.[0] || "https://placehold.co/400x400/f5f0e8/8b7355?text=No+Image";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: prod._id.toString(),
      name: prod.name,
      price: prod.price,
      image: img,
      vendorId: prod.vendorId.toString(),
    }, 1);
    
    showSuccess("Added to Cart!", `${prod.name} is now in your cart.`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status !== "authenticated") {
      showToast("Please sign in to buy now! 💚");
      openAuthModal();
      return;
    }
    
    setBuyNowItem({
      id: prod._id.toString(),
      name: prod.name,
      price: prod.price,
      image: img,
      vendorId: prod.vendorId.toString(),
      quantity: 1,
    });
    
    openCheckout();
  };

  return (
    <div className="group bg-white rounded-xl border border-[#E8E6E1] hover:border-brand-primary/30 overflow-hidden flex flex-col p-3 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <span className="bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}
        {prod.stock <= 0 && (
          <span className="bg-gray-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
            SOLD OUT
          </span>
        )}
      </div>

      {/* Image — fixed aspect-square box; object-cover keeps every product at
          the same visual footprint regardless of source-image aspect ratio. */}
      <Link href={`/products/${prod.slug}`} className="w-full relative aspect-square bg-[#FAF7F2] rounded-lg overflow-hidden mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={prod.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Quick Buy Overlay on Hover */}
        {prod.stock > 0 && (
           <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={handleBuyNow}
                className="bg-brand-accent text-brand-text text-[10px] font-black px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-accent-dark"
              >
                Buy Now
              </button>
           </div>
        )}
      </Link>

      {/* Info Container */}
      <div className="flex-1 flex flex-col px-1">
        <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest mb-1 line-clamp-1">
          {prod.categoryId?.name || "PJ BITE"}
        </p>
        
        <Link href={`/products/${prod.slug}`}>
          <h3 className="text-sm font-bold text-brand-text line-clamp-2 leading-snug mb-2 group-hover:text-brand-primary transition-colors h-[40px]">
            {prod.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-end justify-between gap-2 mb-3">
          <div className="flex flex-col">
             {prod.originalPrice && prod.originalPrice > prod.price && (
               <span className="text-[10px] text-gray-400 line-through">₹{prod.originalPrice.toFixed(2)}</span>
             )}
             <span className="text-base font-black text-brand-primary leading-none">₹{prod.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-0.5 text-amber-400">
             <Star className="w-3 h-3 fill-current" />
             <span className="text-[9px] font-bold text-gray-400">4.8</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        {prod.stock <= 0 ? (
           <button disabled className="w-full flex items-center justify-center gap-1.5 bg-gray-100 text-gray-400 text-[10px] font-black py-2.5 rounded-lg uppercase tracking-widest cursor-not-allowed">
             Out of Stock
           </button>
        ) : (
           <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-1 bg-white border-2 border-brand-primary text-brand-primary hover:bg-brand-bg text-[9px] font-black py-2.5 rounded-lg uppercase tracking-widest transition-all shadow-sm group"
              >
               <ShoppingBag className="w-3 h-3 group-hover:scale-110 transition-transform" /> Cart
             </button>
             <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-1 bg-brand-accent hover:bg-brand-accent-dark text-brand-text text-[9px] font-black py-2.5 rounded-lg uppercase tracking-widest transition-all shadow-sm hover:shadow-md"
              >
               Buy Now
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
