import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const DEFAULTS = {
  freeShippingThreshold: 499,
  shippingCost: 49,
  codCharge: 50,
  isCodEnabled: true,
  prepaidDiscountPercentage: 0,
};

export async function GET() {
  try {
    await dbConnect();
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(DEFAULTS);
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const { _id, __v, createdAt, updatedAt, ...fields } = body;
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({ ...DEFAULTS, ...fields });
    } else {
      Object.assign(settings, fields);
      await settings.save();
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
