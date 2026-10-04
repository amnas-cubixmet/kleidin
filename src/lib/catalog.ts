import {
  getProductBySlugFromDb,
  getWholesaleProductBySlugFromDb,
  isProductDatabaseConfigured,
  listProducts,
} from "@/lib/supabase-products";

export async function getCatalogProducts() {
  if (!isProductDatabaseConfigured()) return [];

  try {
    return await listProducts({ activeOnly: true });
  } catch {
    // Public storefront must remain available even while the database schema
    // is being created, migrated, or temporarily unavailable.
    return [];
  }
}

export async function getCatalogProductBySlug(slug: string) {
  if (!isProductDatabaseConfigured()) return null;

  try {
    return await getProductBySlugFromDb(slug);
  } catch {
    return null;
  }
}

export async function getWholesaleProductBySlug(slug: string) {
  if (!isProductDatabaseConfigured()) return null;

  try {
    return await getWholesaleProductBySlugFromDb(slug);
  } catch {
    return null;
  }
}
