import { type NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminRequest } from "@/lib/admin-api";
import {
  deleteHomepageHeroCampaign,
  getHomepageHeroCampaign,
  updateHomepageHeroCampaign,
} from "@/lib/mongodb-homepage-hero";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  try {
    const { id } = await params;
    const campaign = await getHomepageHeroCampaign(id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Homepage hero not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const campaign = await updateHomepageHeroCampaign(id, body);

    if (!campaign) {
      return NextResponse.json(
        { error: "Homepage hero not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  try {
    const { id } = await params;
    const deleted = await deleteHomepageHeroCampaign(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Homepage hero not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
