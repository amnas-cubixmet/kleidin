import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { seedRealisticInternalData } from "@/lib/realistic-seed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await seedRealisticInternalData();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not seed internal data.";

    const schemaMissing =
      message.includes("PGRST205") ||
      message.includes("schema cache") ||
      message.includes("Could not find the table");

    return NextResponse.json(
      {
        error: schemaMissing
          ? "Supabase tables are not ready. Run supabase/schema.sql in the Supabase SQL Editor first."
          : message,
      },
      { status: schemaMissing ? 409 : 500 },
    );
  }
}
