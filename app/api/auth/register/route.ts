import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { sendAuthEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (overwrites any existing OTP for this email)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send OTP email via Brevo
    const subject = "Verify your account - Fruit Bite";
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #27ae60; text-align: center;">Account Verification</h2>
        <p>Hello ${name},</p>
        <p>Thank you for joining Fruit Bite! To complete your registration, please use the following verification code:</p>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #27ae60; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">© 2024 Fruit Bite. Premium Dry Fruits & Nuts.</p>
      </div>
    `;
    
    const emailSent = await sendAuthEmail({ to: email, subject, html });
    
    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent to email" }, { status: 200 });
  } catch (error) {
    console.error("Register request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
