import { type NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminRequest } from "@/lib/admin-api";
import {
  createHomepageHeroCampaign,
  listHomepageHeroCampaigns,
} from "@/lib/mongodb-homepage-hero";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  try {
    return NextResponse.json({
      campaigns: await listHomepageHeroCampaigns(),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    return NextResponse.json(
      { campaign: await createHomepageHeroCampaign(body) },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
