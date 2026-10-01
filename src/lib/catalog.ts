import {
  getActiveProducts,
  getProductBySlug,
  getProductByWholesaleSlug,
} from "@/data/products";

export async function getCatalogProducts() {
  return getActiveProducts();
}

export async function getCatalogProductBySlug(slug: string) {
  return getProductBySlug(slug);
}

export async function getWholesaleProductBySlug(slug: string) {
  return getProductByWholesaleSlug(slug);
}
