import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import StoreSettings from "@/models/StoreSettings";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: NextRequest) {
  try {
    const { items, customerDetails, couponCode, paymentMethod } = await req.json(); // items is array of {id, quantity}

    await dbConnect();

    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of items) {
      const product = await Product.findById(item.id).lean() as any;
      if (!product) continue;
      
      // Stock Validation
      if (item.variantId) {
        const variant = product.variants?.find((v: any) => v._id.toString() === item.variantId);
        if (!variant || (variant.stock ?? 0) < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for ${product.name}${variant ? ` (${variant.name})` : ""}. Only ${variant?.stock || 0} left.` 
          }, { status: 400 });
        }
      } else {
        if ((product.stock ?? 0) < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for ${product.name}. Only ${product.stock} left.` 
          }, { status: 400 });
        }
      }

      const lineCost = (item.price || product.price) * item.quantity;
      totalAmount += lineCost;
      
      validatedProducts.push({
        productId: product._id.toString(),
        variantId: item.variantId || null,
        name: item.name || product.name,
        price: item.price || product.price,
        quantity: item.quantity,
        vendorId: product.vendorId.toString(),
        image: item.image || product.images?.[0] || "",
      });
    }

    if (validatedProducts.length === 0) {
      return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
    }

    let discountApplied = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date() && totalAmount >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountApplied = (totalAmount * coupon.discountValue) / 100;
        } else {
          discountApplied = coupon.discountValue;
        }
      }
    }

    // Pull shipping/COD/prepaid settings from the store so we can authoritatively
    // recompute the same total the UI displays. Previously the Razorpay order
    // was created with only (items − coupon), which silently undercharged for
    // shipping and COD fees compared to what the user saw in checkout.
    const settings = (await StoreSettings.findOne().lean()) as any;
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 499;
    const shippingCost = settings?.shippingCost ?? 50;
    const codCharge = settings?.codCharge ?? 0;
    const prepaidDiscountPct = settings?.prepaidDiscountPercentage ?? 0;

    const shippingCharge = totalAmount > 0 && totalAmount < freeShippingThreshold ? shippingCost : 0;
    const codFee = paymentMethod === "COD" ? codCharge : 0;
    const prepaidDiscount = paymentMethod !== "COD" && prepaidDiscountPct > 0
      ? (totalAmount * prepaidDiscountPct) / 100
      : 0;

    const finalAmount = Math.max(
      totalAmount + shippingCharge + codFee - discountApplied - prepaidDiscount,
      0,
    );

    // COD path: validation-only, no Razorpay order needed. Skipping the
    // Razorpay call here is what prevents COD from failing on "Cart validation
    // failed" when Razorpay keys are misconfigured or temporarily unreachable.
    if (paymentMethod === "COD") {
      return NextResponse.json({
        products: validatedProducts,
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        finalAmount,
      });
    }

    const options = {
      amount: Math.round(finalAmount * 100), // paise
      currency: "INR",
      receipt: `receipt_cart_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      products: validatedProducts,
      finalAmount,
    });
  } catch (error: any) {
    console.error("[CART_VALIDATE_ERROR]", error);
    // Surface the actual stock/coupon message when possible; only fall back to
    // the generic text for unexpected failures.
    const message = typeof error?.message === "string" ? error.message : "Failed to create cart order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
