import { type NextRequest, NextResponse } from "next/server";
import { requireAdminRequest, apiError } from "@/lib/admin-api";
import { createSignedUpload } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => ({}))) as { folder?: string };
    return NextResponse.json(
      createSignedUpload(body.folder?.trim() || "kleidin/uploads"),
    );
  } catch (error) {
    return apiError(error);
  }
}
