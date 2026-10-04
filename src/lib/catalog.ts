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
  } catch (error) {
    console.error("Could not load Supabase catalog:", error);
    return [];
  }
}

export async function getCatalogProductBySlug(slug: string) {
  if (!isProductDatabaseConfigured()) return null;

  try {
    return await getProductBySlugFromDb(slug);
  } catch (error) {
    console.error("Could not load Supabase product:", error);
    return null;
  }
}

export async function getWholesaleProductBySlug(slug: string) {
  if (!isProductDatabaseConfigured()) return null;

  try {
    return await getWholesaleProductBySlugFromDb(slug);
  } catch (error) {
    console.error("Could not load Supabase wholesale product:", error);
    return null;
  }
}
