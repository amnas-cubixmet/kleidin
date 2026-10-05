import "server-only";

import { Db, MongoClient } from "mongodb";
import { requireMongoEnvironment } from "@/lib/server-env";

declare global {
  var __kleidinMongoClientPromise: Promise<MongoClient> | undefined;
  var __kleidinIndexPromise: Promise<void> | undefined;
}

function getClientPromise() {
  const { uri } = requireMongoEnvironment();

  if (!global.__kleidinMongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
    });
    global.__kleidinMongoClientPromise = client.connect();
  }

  return global.__kleidinMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const { dbName } = requireMongoEnvironment();
  const db = client.db(dbName);
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(db: Db) {
  if (!global.__kleidinIndexPromise) {
    global.__kleidinIndexPromise = Promise.all([
      db.collection("products").createIndex({ slug: 1 }, { unique: true }),
      db.collection("products").createIndex({ sku: 1 }, { unique: true }),
      db.collection("products").createIndex({ status: 1, sortOrder: 1 }),
      db.collection("orders").createIndex({ orderNumber: 1 }, { unique: true }),
      db.collection("orders").createIndex({ createdAt: -1 }),
      db.collection("orders").createIndex({ status: 1, createdAt: -1 }),
      db.collection("customers").createIndex({ phone: 1 }),
      db.collection("customers").createIndex({ email: 1 }),
      db.collection("inventoryMovements").createIndex({ productId: 1, createdAt: -1 }),
      db.collection("siteSettings").createIndex({ key: 1 }, { unique: true }),
      db.collection("heroSlides").createIndex({ enabled: 1, order: 1 }),
    ]).then(() => undefined);
  }

  await global.__kleidinIndexPromise;
}
