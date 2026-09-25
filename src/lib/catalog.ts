import { getActiveProducts, getProductBySlug } from "@/data/products";

export async function getCatalogProducts() {
  return getActiveProducts();
}

export async function getCatalogProductBySlug(slug: string) {
  return getProductBySlug(slug);
}
