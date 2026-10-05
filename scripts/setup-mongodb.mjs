import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equals = trimmed.indexOf("=");
    if (equals < 1) continue;

    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

const cwd = process.cwd();
loadEnvFile(path.join(cwd, ".env.local"));
loadEnvFile(path.join(cwd, ".env"));

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB?.trim() || "kleidin";

if (!uri) {
  console.error("\nMissing MONGODB_URI in .env.local\n");
  process.exit(1);
}

const client = new MongoClient(uri, {
  appName: "kleidin-setup",
  serverSelectionTimeoutMS: 10_000,
});

try {
  await client.connect();
  const db = client.db(dbName);

  const cleanupResults = await Promise.all([
    db.collection("products").deleteMany({ isDemo: true }),
    db.collection("orders").deleteMany({ isDemo: true }),
    db.collection("testimonials").deleteMany({ isDemo: true }),
    db.collection("heroSlides").deleteMany({ isDemo: true }),
    db.collection("announcements").deleteMany({ isDemo: true }),
  ]);
  await db.collection("appSettings").deleteOne({ key: "demoMode" });

  await Promise.all([
    db.collection("products").createIndexes([
      { key: { id: 1 }, unique: true, name: "products_id_unique" },
      { key: { sku: 1 }, unique: true, name: "products_sku_unique" },
      { key: { slug: 1 }, unique: true, name: "products_slug_unique" },
      { key: { wholesaleSlug: 1 }, unique: true, sparse: true, name: "products_wholesale_slug_unique" },
      { key: { status: 1, sortOrder: 1 }, name: "products_status_sort" },
      { key: { featured: 1, featuredSortOrder: 1 }, name: "products_featured_home_sort" },
    ]),
    db.collection("orders").createIndexes([
      { key: { id: 1 }, unique: true, name: "orders_id_unique" },
      { key: { orderNumber: 1 }, unique: true, name: "orders_number_unique" },
      { key: { createdAt: -1 }, name: "orders_created_desc" },
      { key: { status: 1, createdAt: -1 }, name: "orders_status_created" },
    ]),
    db.collection("testimonials").createIndexes([
      { key: { id: 1 }, unique: true, name: "testimonials_id_unique" },
      { key: { createdAt: -1 }, name: "testimonials_created_desc" },
      { key: { productSlug: 1 }, name: "testimonials_product_slug" },
      { key: { enabled: 1, pending: 1, showOnHome: 1 }, name: "testimonials_public_state" },
    ]),
    db.collection("heroSlides").createIndexes([
      { key: { id: 1 }, unique: true, name: "hero_id_unique" },
      { key: { enabled: 1, order: 1 }, name: "hero_enabled_order" },
    ]),
    db.collection("announcements").createIndexes([
      { key: { id: 1 }, unique: true, name: "announcements_id_unique" },
      { key: { enabled: 1, sortOrder: 1 }, name: "announcements_enabled_sort" },
    ]),
  ]);

  await db.command({ ping: 1 });

  console.log("\nMongoDB Atlas connected successfully.");
  console.log("Database:", dbName);
  console.log(
    "Removed legacy demo records:",
    cleanupResults.reduce((sum, result) => sum + result.deletedCount, 0),
  );
  console.log("Collections/indexes are ready.\n");
} catch (error) {
  console.error("\nMongoDB Atlas setup failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.close();
}
