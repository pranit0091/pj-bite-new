import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendOrderEmail } from "@/lib/mailer";

/**
 * POST /api/checkout/cart-cod
 * Creates a COD order from a multi-item cart.
 * No payment verification needed - payment happens on delivery.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      productsInfo,
      customerDetails,
      rawAddress,
      totalAmount,
      couponCode,
      discountApplied,
    } = await req.json();

    if (!productsInfo || productsInfo.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await dbConnect();

    const formattedProducts = productsInfo.map((p: any) => ({
      productId: p.productId,
      variantId: p.variantId || null,
      quantity: p.quantity,
      price: p.price,
      name: p.name,
      image: p.image || "",
    }));

    const primaryVendor = productsInfo[0]?.vendorId;

    const newOrder = await Order.create({
      customerDetails,
      products: formattedProducts,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "Pending",
      vendorId: primaryVendor,
      couponCode,
      discountApplied,
      statusTimeline: [{
        status: "Pending",
        description: "Order placed successfully via Cash on Delivery",
        timestamp: new Date(),
      }],
    });

    // ── Stock Management: Decrement after Order ──
    try {
      for (const item of formattedProducts) {
        if (item.variantId) {
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
        } else {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } }
          );
        }
      }
    } catch (stockError) {
      console.error("[COD_STOCK_DECREMENT_ERROR]", stockError);
    }

    // Auto-save address to User Profile
    const session = await getServerSession(authOptions);
    if (session?.user?.email && rawAddress) {
      try {
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          const streetPattern = new RegExp(`^${rawAddress.street}$`, "i");
          const exists = user.savedAddresses?.some((a: any) => streetPattern.test(a.street));
          if (!exists) {
            if (!user.savedAddresses) user.savedAddresses = [];
            user.savedAddresses.push({
              label: "Home",
              street: rawAddress.street,
              city: rawAddress.city,
              state: rawAddress.state,
              zip: rawAddress.zip,
              phone: customerDetails.phone,
            });
            await user.save();
          }
        }
      } catch (e) {
        console.error("[COD_ADDRESS_SAVE_ERROR]", e);
      }
    }

    // ── Send Confirmation Email to Customer ──
    const orderItemsHtml = formattedProducts
      .map(
        (p: any) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${p.name}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;">${p.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;">₹${p.price}</td>
        </tr>`
      )
      .join("");

    await sendOrderEmail({
      to: customerDetails.email,
      subject: `Order Confirmed (COD) — #${newOrder._id.toString().substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e8e8e8;border-radius:8px;">
          <h2 style="color:#2e7d32;">Order Received — Pay on Delivery</h2>
          <p>Hi ${customerDetails.name},</p>
          <p>We've received your order and it's being processed. Please keep <strong>₹${totalAmount}</strong> ready to pay at the time of delivery.</p>
          <h3 style="border-bottom:2px solid #eee;padding-bottom:8px;">Order #${newOrder._id.toString().substring(0, 8).toUpperCase()}</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f9f9f9;">
                <th style="padding:10px;text-align:left;">Item</th>
                <th style="padding:10px;text-align:left;">Qty</th>
                <th style="padding:10px;text-align:left;">Price</th>
              </tr>
            </thead>
            <tbody>${orderItemsHtml}</tbody>
            <tfoot>
              <tr>
                <th colspan="2" style="padding:10px;text-align:right;">Total to Pay on Delivery:</th>
                <th style="padding:10px;text-align:left;color:#2e7d32;">₹${totalAmount}</th>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top:20px;">We'll notify you once your order ships. You can track your order anytime from your dashboard.</p>
          <a href="https://pjbite.com/dashboard" style="display:inline-block;margin-top:10px;padding:12px 24px;background:#2e7d32;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Track My Order</a>
        </div>
      `,
    });

    // ── Notify Admin ──
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendOrderEmail({
        to: adminEmail,
        subject: `New COD Order — #${newOrder._id.toString().substring(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;">
            <h2 style="color:#e65100;">New Cash on Delivery Order!</h2>
            <p><strong>Order ID:</strong> ${newOrder._id}</p>
            <p><strong>Customer:</strong> ${customerDetails.name} (${customerDetails.email})</p>
            <p><strong>Phone:</strong> ${customerDetails.phone}</p>
            <p><strong>Address:</strong> ${customerDetails.address}</p>
            <p><strong>Total COD Amount:</strong> ₹${totalAmount}</p>
            <p><strong>Items:</strong> ${formattedProducts.length}</p>
            <p>Login to your admin panel to process this shipment.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error("[CART_COD_ERROR]", error);
    return NextResponse.json({ error: "Failed to place COD order" }, { status: 500 });
  }
}
