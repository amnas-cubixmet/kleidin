import { products } from "@/data/products";

export function getCatalogProducts() {
  return products.filter((product) => product.status !== "draft");
}

export function getCatalogProductBySlug(slug: string) {
  return (
    products.find(
      (product) => product.slug === slug && product.status !== "draft",
    ) ?? null
  );
}

export function getWholesaleProductBySlug(slug: string) {
  return (
    products.find(
      (product) =>
        product.wholesaleEnabled &&
        (product.wholesaleSlug ?? `${product.slug}-dealer`) === slug &&
        product.status !== "draft",
    ) ?? null
  );
}
