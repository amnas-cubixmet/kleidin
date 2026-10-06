import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  getAdminEnvironment,
  getCloudinaryDirectEnvironment,
  getMongoEnvironment,
} from "@/lib/server-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const mongoConfigured = Boolean(getMongoEnvironment());
  let database = "not-configured";

  if (mongoConfigured) {
    try {
      const db = await getDb();
      await db.command({ ping: 1 });
      database = "ok";
    } catch {
      database = "error";
    }
  }

  return NextResponse.json({
    ok: database !== "error",
    database,
    adminConfigured: Boolean(getAdminEnvironment()),
    cloudinaryConfigured: Boolean(getCloudinaryDirectEnvironment()),
  });
}
