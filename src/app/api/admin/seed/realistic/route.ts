import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  clearRealisticInternalData,
  seedRealisticInternalData,
} from "@/lib/realistic-seed";

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

    const mongoSetupIssue =
      message.includes("MongoDB Atlas is not configured") ||
      message.includes("server selection") ||
      message.includes("ENOTFOUND") ||
      message.includes("authentication failed");

    return NextResponse.json(
      {
        error: mongoSetupIssue
          ? "MongoDB Atlas is not ready. Add MONGODB_URI and MONGODB_DB, allow network access, then run npm run db:setup."
          : message,
      },
      { status: mongoSetupIssue ? 409 : 500 },
    );
  }
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const removed = await clearRealisticInternalData();
    return NextResponse.json({ ok: true, removed });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not clear internal demo data.",
      },
      { status: 500 },
    );
  }
}
