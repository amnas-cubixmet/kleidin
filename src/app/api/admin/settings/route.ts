import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getStoreSettingsFromDb,
  isStoreSettingsDatabaseConfigured,
  saveStoreSettings,
} from "@/lib/mongodb-site-settings";
import type { StoreSettings } from "@/types/commerce";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function validOptionalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStoreSettingsDatabaseConfigured()) {
    return NextResponse.json(
      { error: "MongoDB Atlas is not configured." },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json({ settings: await getStoreSettingsFromDb() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load store settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStoreSettingsDatabaseConfigured()) {
    return NextResponse.json(
      { error: "MongoDB Atlas is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Partial<StoreSettings>;

    if (!validOptionalUrl(body.instagramUrl)) {
      return NextResponse.json({ error: "Enter a valid Instagram URL." }, { status: 400 });
    }
    if (!validOptionalUrl(body.facebookUrl)) {
      return NextResponse.json({ error: "Enter a valid Facebook URL." }, { status: 400 });
    }

    const settings = await saveStoreSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save store settings." },
      { status: 500 },
    );
  }
}
