import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { sendAuthEmail } from "@/lib/mailer";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." }, { status: 200 });
    }

    // Generate and store OTP
    const otp = generateOTP();
    
    // Remove existing OTPs for this email to prevent spam issues
    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
    });

    // Send email
    const subject = "Password Reset - Fruit Bite";
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #27ae60;">Fruit Bite Security</h2>
        <p>You requested a password reset. Here is your 6-digit confirmation code:</p>
        <div style="background-color: #f9f9f9; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendAuthEmail({ to: email, subject, html });

    return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
