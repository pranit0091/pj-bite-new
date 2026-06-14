import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
console.log("CLOUD_NAME:", CLOUD_NAME);
console.log("UPLOAD_PRESET:", UPLOAD_PRESET);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "fruitbite";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Use unsigned upload via Cloudinary REST API (no API key/secret required)
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", UPLOAD_PRESET);
    cloudinaryForm.append("folder", folder);

    // /auto/upload routes images to image storage and PDFs / raw files to raw
    // storage, so the same endpoint handles quality-card images AND uploaded
    // test-report PDFs without a separate route.
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: cloudinaryForm }
    );

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return NextResponse.json({ url: data.secure_url }, { status: 200 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
