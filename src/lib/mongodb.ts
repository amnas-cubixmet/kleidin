import { MongoClient, type Db } from "mongodb";
import { getMongoServerEnvironment } from "@/lib/server-env";

type MongoGlobal = typeof globalThis & {
  __kleidinMongoClientPromise?: Promise<MongoClient>;
  __kleidinMongoIndexPromise?: Promise<void>;
};

const mongoGlobal = globalThis as MongoGlobal;

export function isMongoDatabaseConfigured() {
  return getMongoServerEnvironment() !== null;
}

async function getClient() {
  const env = getMongoServerEnvironment();
  if (!env) throw new Error("MongoDB Atlas is not configured.");

  if (!mongoGlobal.__kleidinMongoClientPromise) {
    const client = new MongoClient(env.uri, {
      appName: "kleidin-nextjs",
      maxPoolSize: 10,
      minPoolSize: 0,
      ignoreUndefined: true,
      maxIdleTimeMS: 30_000,
      serverSelectionTimeoutMS: 8_000,
    });

    mongoGlobal.__kleidinMongoClientPromise = client.connect().catch((error) => {
      delete mongoGlobal.__kleidinMongoClientPromise;
      throw error;
    });
  }

  return mongoGlobal.__kleidinMongoClientPromise;
}

export async function getMongoDatabase(): Promise<Db> {
  const env = getMongoServerEnvironment();
  if (!env) throw new Error("MongoDB Atlas is not configured.");

  const client = await getClient();
  const db = client.db(env.dbName);

  if (!mongoGlobal.__kleidinMongoIndexPromise) {
    mongoGlobal.__kleidinMongoIndexPromise = ensureMongoIndexes(db).catch(
      (error) => {
        delete mongoGlobal.__kleidinMongoIndexPromise;
        throw error;
      },
    );
  }

  await mongoGlobal.__kleidinMongoIndexPromise;
  return db;
}

async function ensureMongoIndexes(db: Db) {
  await Promise.all([
    db.collection("products").createIndexes([
      { key: { id: 1 }, unique: true, name: "products_id_unique" },
      { key: { sku: 1 }, unique: true, name: "products_sku_unique" },
      { key: { slug: 1 }, unique: true, name: "products_slug_unique" },
      {
        key: { wholesaleSlug: 1 },
        unique: true,
        sparse: true,
        name: "products_wholesale_slug_unique",
      },
      { key: { status: 1, sortOrder: 1 }, name: "products_status_sort" },
      { key: { featured: 1, featuredSortOrder: 1 }, name: "products_featured_sort" },
      { key: { isDemo: 1 }, name: "products_demo" },
    ]),
    db.collection("orders").createIndexes([
      { key: { id: 1 }, unique: true, name: "orders_id_unique" },
      { key: { orderNumber: 1 }, unique: true, name: "orders_number_unique" },
      { key: { createdAt: -1 }, name: "orders_created_desc" },
      { key: { status: 1, createdAt: -1 }, name: "orders_status_created" },
      { key: { isDemo: 1 }, name: "orders_demo" },
    ]),
    db.collection("testimonials").createIndexes([
      { key: { id: 1 }, unique: true, name: "testimonials_id_unique" },
      { key: { createdAt: -1 }, name: "testimonials_created_desc" },
      { key: { productSlug: 1 }, name: "testimonials_product_slug" },
      {
        key: { enabled: 1, pending: 1, showOnHome: 1 },
        name: "testimonials_public_state",
      },
      { key: { isDemo: 1 }, name: "testimonials_demo" },
    ]),
    db.collection("heroSlides").createIndexes([
      { key: { id: 1 }, unique: true, name: "hero_id_unique" },
      { key: { enabled: 1, order: 1 }, name: "hero_enabled_order" },
      { key: { isDemo: 1 }, name: "hero_demo" },
    ]),
    db.collection("announcements").createIndexes([
      { key: { id: 1 }, unique: true, name: "announcements_id_unique" },
      { key: { enabled: 1, sortOrder: 1 }, name: "announcements_enabled_sort" },
      { key: { isDemo: 1 }, name: "announcements_demo" },
    ]),
    db.collection("siteSettings").createIndex(
      { key: 1 },
      { unique: true, name: "site_settings_key_unique" },
    ),
  ]);
}
