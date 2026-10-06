import { type NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_UNSIGNED_UPLOAD_PRESET = "kleidin_unsigned";

export async function GET(request: NextRequest) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

  if (!cloudName) {
    return NextResponse.json(
      { error: "CLOUDINARY_CLOUD_NAME is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    cloudName,
    uploadPreset:
      process.env.CLOUDINARY_UPLOAD_PRESET?.trim() ||
      DEFAULT_UNSIGNED_UPLOAD_PRESET,
  });
}
