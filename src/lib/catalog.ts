import { cache } from "react";
import {
  getProductBySlugFromDb,
  getWholesaleProductBySlugFromDb,
  isProductDatabaseConfigured,
  listProducts,
} from "@/lib/supabase-products";

export const getCatalogProducts = cache(async () => {
  if (!isProductDatabaseConfigured()) return [];

  try {
    return await listProducts({ activeOnly: true });
  } catch {
    // Public storefront must remain available even while the database schema
    // is being created, migrated, or temporarily unavailable.
    return [];
  }
});

export const getCatalogProductBySlug = cache(async (slug: string) => {
  if (!isProductDatabaseConfigured()) return null;

  try {
    return await getProductBySlugFromDb(slug);
  } catch {
    return null;
  }
});

export const getWholesaleProductBySlug = cache(async (slug: string) => {
  if (!isProductDatabaseConfigured()) return null;

  try {
    return await getWholesaleProductBySlugFromDb(slug);
  } catch {
    return null;
  }
});
