import { getMongoDatabase, isMongoDatabaseConfigured } from "@/lib/mongodb";

type DemoModeDocument = {
  key: "demoMode";
  enabled: boolean;
  updatedAt: string;
};

const COLLECTION = "appSettings";

export async function getDemoModeEnabled() {
  // Project demo mode is intentionally ON by default until the admin turns it off.
  if (!isMongoDatabaseConfigured()) return true;

  try {
    const db = await getMongoDatabase();
    const row = await db
      .collection<DemoModeDocument>(COLLECTION)
      .findOne({ key: "demoMode" });

    return row?.enabled ?? true;
  } catch {
    return true;
  }
}

export async function setDemoModeEnabled(enabled: boolean) {
  const db = await getMongoDatabase();
  await db.collection<DemoModeDocument>(COLLECTION).updateOne(
    { key: "demoMode" },
    {
      $set: {
        enabled,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  return enabled;
}
