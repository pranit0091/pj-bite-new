import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * POST /api/orders/[id]/cancel
 * User can cancel an order only while status is PROCESSING.
 * Auto-triggers refund if already paid.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { reason } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only the owner can cancel
    if (order.customerDetails.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can only cancel if order is still PROCESSING (not yet shipped)
    if (order.deliveryStatus !== "PROCESSING") {
      return NextResponse.json(
        { error: `Cannot cancel order that is already ${order.deliveryStatus}.` },
        { status: 400 }
      );
    }

    if (order.cancellationRequested) {
      return NextResponse.json({ error: "Cancellation already requested." }, { status: 400 });
    }

    // Mark cancellation requested
    order.cancellationRequested = true;
    order.cancellationReason = reason || "Requested by customer";
    order.cancellationRequestedAt = new Date();
    order.deliveryStatus = "CANCELLED";
    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    // If payment was made → auto-initiate refund via Razorpay
    if (order.paymentStatus === "PAID" && order.razorpayPaymentId) {
      try {
        const refundResult = await initiateRazorpayRefund(
          order.razorpayPaymentId,
          order.totalAmount
        );
        order.refundStatus = "PROCESSED";
        order.razorpayRefundId = refundResult.id;
        order.refundAmount = order.totalAmount;
        order.refundProcessedAt = new Date();
        order.paymentStatus = "REFUNDED";
        order.refundNote = "Auto-refunded on order cancellation";
      } catch (refundErr) {
        // Don't fail the cancellation — mark for manual review
        order.refundStatus = "PENDING";
        order.refundNote = "Auto-refund failed — pending manual processing";
      }
    } else {
      order.refundStatus = "NOT_REQUESTED";
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
      refundStatus: order.refundStatus,
    });
  } catch (error) {
    console.error("[ORDER_CANCEL]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── Razorpay refund helper ──────────────────────────────────────────────────
async function initiateRazorpayRefund(paymentId: string, amount: number) {
  const key = process.env.RAZORPAY_KEY_ID!;
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        speed: "normal",
        notes: { reason: "Customer requested cancellation" },
      }),
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData?.error?.description || "Razorpay refund failed");
  }

  return res.json();
}
