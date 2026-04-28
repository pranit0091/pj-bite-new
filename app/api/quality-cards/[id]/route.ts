import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import QualityCard from "@/models/QualityCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPERADMIN") return false;
  return true;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const doc = await QualityCard.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const doc = await QualityCard.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
