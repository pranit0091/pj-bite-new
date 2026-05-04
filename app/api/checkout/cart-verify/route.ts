import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendOrderEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      productsInfo, // Array of products
      customerDetails,
      rawAddress,
      totalAmount,
      couponCode,
      discountApplied
    } = await req.json();

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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

    // In a multi-vendor cart, it's complex to attribute the entire order to one vendor.
    // For simplicity in this tracking, we label the vendorId of the first product (or leave null).
    // A robust system splits the cart per vendor, but this creates a single global order containing mixed items.
    const primaryVendor = productsInfo[0]?.vendorId;

    const newOrder = await Order.create({
      customerDetails,
      products: formattedProducts,
      totalAmount: totalAmount,
      paymentStatus: "PAID",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      vendorId: primaryVendor, 
      couponCode,
      discountApplied
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
      console.error("Stock decrement error:", stockError);
    }

    // Auto-save address to User Profile if authenticated
    const session = await getServerSession(authOptions);
    if (session?.user?.email && rawAddress) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        const streetPattern = new RegExp(`^${rawAddress.street}$`, "i");
        const exists = user.savedAddresses?.some((a: any) => streetPattern.test(a.street));
        if (!exists) {
          if (!user.savedAddresses) {
            user.savedAddresses = [];
          }
          user.savedAddresses.push({
            label: "Home",
            street: rawAddress.street,
            city: rawAddress.city,
            state: rawAddress.state,
            zip: rawAddress.zip,
            phone: customerDetails.phone
          });
          await user.save();
        }
      }
    }

    const orderItemsHtml = formattedProducts.map((p: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${p.price}</td>
      </tr>
    `).join("");

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #27ae60;">Order Confirmation</h2>
        <p>Hi ${customerDetails.name?.split(' ')[0] || customerDetails.name},</p>
        <p>Thank you for your order! Your payment has been successfully processed.</p>
        <h3>Order details (ID: ${newOrder._id})</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Qty</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <th colspan="2" style="padding: 10px; text-align: right;">Total Amount:</th>
              <th style="padding: 10px; text-align: left;">₹${totalAmount}</th>
            </tr>
          </tfoot>
        </table>
        <p>We'll notify you once it ships.</p>
      </div>
    `;

    await sendOrderEmail({ 
      to: customerDetails.email, 
      subject: `Order Confirmation - #${newOrder._id}`, 
      html: customerHtml 
    });

    const adminEmail = process.env.ADMIN_EMAIL || "admin@fruitbite.com";
    if (adminEmail) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c0392b;">New Order Received!</h2>
          <p>Order ID: ${newOrder._id}</p>
          <p>Customer: ${customerDetails.name} (${customerDetails.email})</p>
          <p>Total Amount: ₹${totalAmount}</p>
          <p>Login to dashboard to view full details.</p>
        </div>
      `;
      await sendOrderEmail({ 
        to: adminEmail, 
        subject: `New Order Received - #${newOrder._id}`, 
        html: adminHtml 
      });
    }

    return NextResponse.json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
