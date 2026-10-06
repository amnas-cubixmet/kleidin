import { type NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-api";
import { getCloudinaryDirectEnvironment } from "@/lib/server-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  const config = getCloudinaryDirectEnvironment();

  if (!config) {
    return NextResponse.json(
      { error: "CLOUDINARY_CLOUD_NAME is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    cloudName: config.cloudName,
    uploadPreset: config.uploadPreset,
  });
}
