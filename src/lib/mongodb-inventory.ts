import "server-only";

import { ObjectId, type Document } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getProductById, updateProduct } from "@/lib/mongodb-products";
import type { InventoryMovement } from "@/types/admin";

function toMovement(doc: Document): InventoryMovement {
  return {
    id: String(doc._id),
    productId: String(doc.productId ?? ""),
    productName: String(doc.productName ?? ""),
    sku: String(doc.sku ?? ""),
    color: typeof doc.color === "string" && doc.color ? doc.color : undefined,
    size: typeof doc.size === "string" && doc.size ? doc.size : undefined,
    delta: Number(doc.delta ?? 0),
    reason: String(doc.reason ?? ""),
    reference:
      typeof doc.reference === "string" && doc.reference
        ? doc.reference
        : undefined,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : new Date(doc.createdAt ?? Date.now()).toISOString(),
  };
}

export async function adjustInventory(input: {
  productId: string;
  delta: number;
  color?: string;
  size?: string;
  reason: string;
  reference?: string;
}) {
  const delta = Math.trunc(Number(input.delta));
  if (!delta) throw new Error("Inventory adjustment must be non-zero.");

  const product = await getProductById(input.productId);
  if (!product) throw new Error("Product not found.");

  const color = input.color?.trim() || undefined;
  const size = input.size?.trim() || undefined;

  let stock = product.stock;
  let colorVariants = [...(product.colorVariants ?? [])];
  let colors = [...product.colors];
  let sizes = [...product.sizes];

  if (color) {
    let index = colorVariants.findIndex(
      (variant) => variant.name.toLowerCase() === color.toLowerCase(),
    );

    if (index < 0) {
      colorVariants.push({
        name: color,
        value: color,
        stock: 0,
        sizeStocks: {},
      });
      colors = Array.from(new Set([...colors, color]));
      index = colorVariants.length - 1;
    }

    const variant = { ...colorVariants[index] };
    const sizeStocks = { ...(variant.sizeStocks ?? {}) };

    if (size) {
      const next = Math.max(0, Number(sizeStocks[size] ?? 0) + delta);
      if (Number(sizeStocks[size] ?? 0) + delta < 0) {
        throw new Error("Not enough stock for this size.");
      }
      sizeStocks[size] = next;
      sizes = Array.from(new Set([...sizes, size]));
      variant.sizeStocks = sizeStocks;
      variant.stock = Object.values(sizeStocks).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      );
    } else {
      const currentVariantStock = Number(variant.stock ?? 0);
      if (currentVariantStock + delta < 0) {
        throw new Error("Not enough stock for this colour.");
      }
      variant.stock = currentVariantStock + delta;
    }

    colorVariants[index] = variant;
    stock = colorVariants.reduce(
      (sum, item) => sum + Math.max(0, Number(item.stock ?? 0)),
      0,
    );
  } else {
    if (stock + delta < 0) throw new Error("Not enough stock.");
    stock += delta;
  }

  const updated = await updateProduct(product.id, {
    stock,
    colors,
    sizes,
    colorVariants,
    status: stock <= 0 ? "sold-out" : product.status === "sold-out" ? "active" : product.status,
  });

  const db = await getDb();
  await db.collection("inventoryMovements").insertOne({
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    color,
    size,
    delta,
    reason: input.reason.trim() || "Manual adjustment",
    reference: input.reference?.trim() || undefined,
    createdAt: new Date(),
  });

  return updated;
}

export async function listInventoryMovements(productId?: string) {
  const db = await getDb();
  const rows = await db
    .collection("inventoryMovements")
    .find(productId ? { productId } : {})
    .sort({ createdAt: -1 })
    .limit(250)
    .toArray();
  return rows.map(toMovement);
}

export async function getInventorySummary(lowStockThreshold = 5) {
  const db = await getDb();
  const rows = await db.collection("products").find({ status: { $ne: "draft" } }).toArray();

  return {
    totalProducts: rows.length,
    totalUnits: rows.reduce((sum, row) => sum + Number(row.stock ?? 0), 0),
    lowStock: rows.filter(
      (row) => Number(row.stock ?? 0) > 0 && Number(row.stock ?? 0) <= lowStockThreshold,
    ).length,
    soldOut: rows.filter((row) => Number(row.stock ?? 0) <= 0).length,
  };
}
