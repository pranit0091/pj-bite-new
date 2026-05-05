import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { sendAuthEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, otp } = await req.json();

    if (!name || !email || !password || !otp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // 1. Verify OTP
    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // 2. Double check email hasn't been taken in the meantime
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteOne({ _id: validOTP._id }); // cleanup
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // 3. Hash password and Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "CUSTOMER",
    });

    // 4. Delete used OTP
    await OTP.deleteOne({ _id: validOTP._id });

    // 5. Optional: Send Welcome Email
    const subject = "Welcome to Fruit Bite!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #27ae60;">Welcome to Fruit Bite, ${name}!</h2>
        <p>Your account has been successfully verified and created.</p>
        <p>Explore our premium selection of dry fruits and enjoy a healthier lifestyle.</p>
      </div>
    `;
    await sendAuthEmail({ to: email, subject, html });

    return NextResponse.json({ 
      success: true, 
      message: "Account verified and created successfully" 
    }, { status: 201 });

  } catch (error) {
    console.error("Verify registration error:", error);
    return NextResponse.json({ error: "Failed to verify account" }, { status: 500 });
  }
}
