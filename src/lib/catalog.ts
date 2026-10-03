import {
  getActiveProducts,
  getProductBySlug,
  getProductByWholesaleSlug,
} from "@/data/products";
import {
  getProductBySlugFromDb,
  getWholesaleProductBySlugFromDb,
  isProductDatabaseConfigured,
  listProducts,
} from "@/lib/supabase-products";

export async function getCatalogProducts() {
  if (!isProductDatabaseConfigured()) return getActiveProducts();

  try {
    return await listProducts({ activeOnly: true });
  } catch (error) {
    console.error("Falling back to bundled catalog:", error);
    return getActiveProducts();
  }
}

export async function getCatalogProductBySlug(slug: string) {
  if (!isProductDatabaseConfigured()) return getProductBySlug(slug);

  try {
    return await getProductBySlugFromDb(slug);
  } catch (error) {
    console.error("Falling back to bundled product:", error);
    return getProductBySlug(slug);
  }
}

export async function getWholesaleProductBySlug(slug: string) {
  if (!isProductDatabaseConfigured()) return getProductByWholesaleSlug(slug);

  try {
    return await getWholesaleProductBySlugFromDb(slug);
  } catch (error) {
    console.error("Falling back to bundled wholesale product:", error);
    return getProductByWholesaleSlug(slug);
  }
}
