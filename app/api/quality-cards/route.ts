import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import QualityCard from "@/models/QualityCard";
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
      const cards = await QualityCard.find().sort({ order: 1, createdAt: 1 });
      return NextResponse.json({ success: true, data: cards });
    }
    const cards = await QualityCard.find({ active: true }).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({ success: true, data: cards });
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
    const card = await QualityCard.create(body);
    return NextResponse.json({ success: true, data: card }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
