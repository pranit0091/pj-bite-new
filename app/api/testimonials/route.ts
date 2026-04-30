import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const adminMode = req.nextUrl.searchParams.get("admin") === "1";
    if (adminMode) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any).role !== "SUPERADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const testimonials = await Testimonial.find().sort({ order: 1, createdAt: 1 });
      return NextResponse.json({ success: true, data: testimonials });
    }
    const testimonials = await Testimonial.find({ active: true }).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const testimonial = await Testimonial.create(body);
    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
