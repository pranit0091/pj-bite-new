import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HomeSettings from "@/models/HomeSettings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const DEFAULT_SETTINGS = {
  trustStrip: [
    { label: "No Colour Added", subline: "100% Raw Nature", iconType: "no-color" },
    { label: "No Added Sugar", subline: "Natural Fruit Sugars", iconType: "no-sugar" },
    { label: "No Chemical", subline: "Zero Toxins", iconType: "no-chemical" },
    { label: "No Flavour", subline: "Authentic Taste", iconType: "no-flavor" },
  ],
  benefits: [
    { label: "Free Shipping", sub: "On Orders Above ₹499", iconName: "Truck" },
    { label: "100% Natural", sub: "No Preservatives Added", iconName: "Shield" },
    { label: "Farm Direct", sub: "Sourced From Farmers", iconName: "Leaf" },
    { label: "Quality Assured", sub: "FSSAI Licensed Lab Tested", iconName: "Award" },
  ],
  purposes: [
    { label: "Gifting", iconName: "Gift", href: "/products?category=gifts" },
    { label: "Snacking", iconName: "Sprout", href: "/products?category=snacks" },
    { label: "Cooking", iconName: "Utensils", href: "/products?category=cooking" },
    { label: "Fitness", iconName: "Dumbbell", href: "/products?category=fitness" },
  ],
  qualityClaims: [
    "✔ 100% Natural",
    "✔ No Added Sugar*",
    "✔ No Preservatives",
    "✔ No Artificial Colors or Flavours",
    "✔ Farm Direct Sourcing",
    "✔ Hygienically Processed",
    "✔ Clean Label Product",
  ],
  whyPjBite: [
    { title: "No Chemicals Ever", desc: "We never use artificial preservatives, colors, or flavor enhancers. What you eat is exactly what nature made.", iconName: "Leaf" },
    { title: "Farm-to-Door", desc: "We partner directly with farmers, cutting out middlemen so you get fresher produce at better prices.", iconName: "Sprout" },
    { title: "Natural Dehydration", desc: "Using sun-drying and modern dehydration tech to preserve nutrients, taste, and texture naturally.", iconName: "Sun" },
  ],
  howItWorks: [
    { step: "01", label: "Farm Sourcing", desc: "Direct from ethical farmers", iconName: "Leaf" },
    { step: "02", label: "Natural Drying", desc: "Zero chemical processing", iconName: "Sun" },
    { step: "03", label: "Quality Check", desc: "Premium quality standards", iconName: "CheckCircle" },
    { step: "04", label: "Doorstep Delivery", desc: "Fresh & sealed arrival", iconName: "Truck" },
  ],
  bulkOrder: {
    badge: "Corporate & Wholesale",
    title: "Big Savings on Bulk Orders! 🥜",
    subtitle: "Contact our team for special pricing on bulk dry fruit orders for events, gifting, and retail.",
  },
};

export async function GET() {
  try {
    await dbConnect();
    let settings = await HomeSettings.findOne();
    if (!settings) {
      settings = await HomeSettings.create(DEFAULT_SETTINGS);
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
    // Strip Mongoose internal fields to prevent version-key conflict on save
    const { _id, __v, createdAt, updatedAt, ...fields } = body;
    let settings = await HomeSettings.findOne();
    if (!settings) {
      settings = await HomeSettings.create({ ...DEFAULT_SETTINGS, ...fields });
    } else {
      Object.assign(settings, fields);
      await settings.save();
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
