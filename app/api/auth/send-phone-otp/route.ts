import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import OTP from "@/models/OTP";
import { sendOtpSms } from "@/lib/fast2sms";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Rate limit: allow at most 1 OTP per 60 seconds per phone
    const recent = await OTP.findOne({
      phone,
      sentAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });
    if (recent) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new OTP" },
        { status: 429 }
      );
    }

    const rawOtp = generateOtp();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    // Replace any pending OTP for this phone
    await OTP.deleteMany({ phone });
    await OTP.create({
      phone,
      otp: hashedOtp,
      sentAt: new Date(),
      createdAt: new Date(), // triggers the 10-min TTL
    });

    await sendOtpSms(phone, rawOtp);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SEND_PHONE_OTP]", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
