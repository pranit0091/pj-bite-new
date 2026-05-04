"use client";

import { useCartStore } from "@/store/useCartStore";

interface BuyNowButtonProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  vendorId: string;
  variantId?: string;
}

export default function RazorpayButton({
  productId,
  name,
  price,
  image,
  vendorId,
  variantId,
}: BuyNowButtonProps) {
  const { setBuyNowItem, openCheckout } = useCartStore();

  const handleBuyNow = () => {
    setBuyNowItem({ id: productId, name, price, image, vendorId, variantId, quantity: 1 });
    openCheckout();
  };

  return (
    <button
      onClick={handleBuyNow}
      className="w-full py-4 bg-gray-900 border border-gray-900 text-white text-sm font-medium hover:bg-black transition-colors mt-2"
    >
      Buy it now
    </button>
  );
}
