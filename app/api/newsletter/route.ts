import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { sendOrderEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    await dbConnect();

    const normalized = email.trim().toLowerCase();

    try {
      await Newsletter.create({ email: normalized, source: "footer" });
    } catch (err: any) {
      // Duplicate (11000) → idempotent success so a re-submit looks the same
      if (err?.code !== 11000) throw err;
    }

    // Notify admin of the new subscriber so the list isn't only visible in DB.
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      await sendOrderEmail({
        to: adminEmail,
        subject: `New newsletter subscriber: ${normalized}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;max-width:540px;margin:0 auto;">
            <h2 style="color:#1E5C2A;margin:0 0 12px;">New Newsletter Signup</h2>
            <p style="color:#1A2010;font-size:14px;margin:0 0 4px;"><strong>Email:</strong> ${normalized}</p>
            <p style="color:#6B7A5E;font-size:12px;margin:0;">Source: footer · ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[NEWSLETTER_ERROR]", error);
    return NextResponse.json({ success: false, error: "Subscription failed. Please try again." }, { status: 500 });
  }
}
