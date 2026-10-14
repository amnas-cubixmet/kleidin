#!/usr/bin/env node
/**
 * Import fictional KLEID.IN products directly into MongoDB without admin/API.
 * Preview by default; --apply plus an exact DB confirmation is required.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import { normalizeDemoProducts, SEED_SOURCE, validateTarget } from "./demo-data.mjs";

const HELP = [
  "KLEID.IN MongoDB demo product importer",
  "",
  "  npm run db:seed:demo",
  "  npm run db:seed:demo -- --apply --confirm-db=kleidin_demo",
  "  npm run db:seed:demo -- --file=scripts/fixtures/demo-products.json",
  "  npm run db:seed:demo -- --apply --confirm-db=kleidin_demo --draft",
  "",
  "Options: --apply, --confirm-db=NAME, --file=PATH, --draft, --allow-live-db, --help",
  "Preview does not access MongoDB. Apply never modifies existing non-demo records.",
].join("\n");

function readArgs(args) {
  const config = { apply: false, draft: false, allowLiveDb: false, confirmDb: "", file: "scripts/fixtures/demo-products.json", help: false };
  for (const arg of args) {
    if (arg === "--apply") config.apply = true;
    else if (arg === "--draft") config.draft = true;
    else if (arg === "--allow-live-db") config.allowLiveDb = true;
    else if (arg === "--help" || arg === "-h") config.help = true;
    else if (arg.startsWith("--confirm-db=")) config.confirmDb = arg.slice("--confirm-db=".length);
    else if (arg.startsWith("--file=")) config.file = arg.slice("--file=".length);
    else throw new Error("Unknown argument: " + arg);
  }
  return config;
}

async function main() {
  const options = readArgs(process.argv.slice(2));
  if (options.help) { console.log(HELP); return; }

  const filename = resolve(process.cwd(), options.file);
  const fixture = JSON.parse(readFileSync(filename, "utf8"));
  const products = normalizeDemoProducts(fixture).map((row) => ({
    ...row, status: options.draft ? "draft" : "active",
  }));

  console.log("KLEID.IN Demo Data | " + products.length + " products | " + (options.draft ? "DRAFT" : "ACTIVE demo preview"));
  console.table(products.map((row) => ({ SKU: row.sku, Product: row.name, Price: "INR " + row.price, Stock: row.stock })));

  if (!options.apply) {
    console.log("Dry run: no database connection and no changes.");
    console.log("To insert, configure MONGODB_URI + MONGODB_DB in .env.local, then pass --apply --confirm-db=YOUR_DB.");
    return;
  }

  // A local .env.local is supported for developers; shell env values remain authoritative.
  if (existsSync(".env.local") && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env.local");
  }
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  const dbName = process.env.MONGODB_DB;
  validateTarget({
    uri, dbName, confirmDb: options.confirmDb,
    allowLiveDb: options.allowLiveDb, nodeEnv: process.env.NODE_ENV,
  });

  const client = new MongoClient(uri, {
    appName: "kleidin-demo-import",
    maxPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    ignoreUndefined: true,
  });

  try {
    await client.connect();
    const collection = client.db(dbName).collection("products");
    await collection.createIndex({ sku: 1 }, { unique: true, name: "products_sku_unique" });
    await collection.createIndex({ slug: 1 }, { unique: true, name: "products_slug_unique" });
    await collection.createIndex({ id: 1 }, { unique: true, name: "products_id_unique" });

    const matches = await collection.find({
      $or: [
        { sku: { $in: products.map((product) => product.sku) } },
        { slug: { $in: products.map((product) => product.slug) } },
      ],
    }, { projection: { sku: 1, slug: 1, seedSource: 1 } }).toArray();

    // Preflight ALL conflicts before making any changes.
    for (const row of matches) {
      const item = products.find((product) => product.sku === row.sku || product.slug === row.slug);
      if (!item || row.seedSource !== SEED_SOURCE || row.sku !== item.sku || row.slug !== item.slug) {
        throw new Error("SKU/slug conflict with existing data: " + String(row.sku || row.slug) + ". No products inserted.");
      }
    }

    const existing = new Set(matches.map((row) => row.sku));
    let inserted = 0;
    let skipped = 0;

    for (const product of products) {
      if (existing.has(product.sku)) { skipped++; continue; }
      const now = new Date();
      await collection.insertOne({
        id: randomUUID(),
        ...product,
        createdAt: now,
        updatedAt: now,
      });
      inserted++;
    }

    console.log("Database: " + dbName + " | Inserted: " + inserted + " | Previously seeded (untouched): " + skipped);
    console.log("Only demo-tagged product records were inserted. Customers/orders remain unchanged.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  // Avoid printing connection-string details on errors.
  const message = String(error instanceof Error ? error.message : error)
    .replace(process.env.MONGODB_URI || "<not-set>", "[redacted]")
    .replace(process.env.DATABASE_URL || "<not-set>", "[redacted]");
  console.error("Demo import failed: " + message);
  process.exitCode = 1;
});
