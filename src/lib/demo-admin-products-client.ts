"use client";

import { demoAdminProducts } from "@/data/demo-admin-products";
import type { Product } from "@/types/product";

export const DEMO_ADMIN_PRODUCTS_STORAGE_KEY = "kleidin-demo-admin-products-v1";
export const DEMO_ADMIN_PRODUCTS_UPDATED_EVENT = "kleidin:demo-products-updated";

function cloneDefaults() {
  return demoAdminProducts.map((product) => ({
    ...product,
    sizes: [...product.sizes],
    colors: [...product.colors],
    colorVariants: product.colorVariants?.map((variant) => ({
      ...variant,
      images: variant.images ? [...variant.images] : undefined,
    })),
  }));
}

export function readDemoAdminProducts(): Product[] {
  if (typeof window === "undefined") return cloneDefaults();

  try {
    const raw = window.localStorage.getItem(DEMO_ADMIN_PRODUCTS_STORAGE_KEY);
    if (!raw) return cloneDefaults();

    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return cloneDefaults();
    return parsed;
  } catch {
    return cloneDefaults();
  }
}

export function writeDemoAdminProducts(products: Product[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    DEMO_ADMIN_PRODUCTS_STORAGE_KEY,
    JSON.stringify(products),
  );
  window.dispatchEvent(new Event(DEMO_ADMIN_PRODUCTS_UPDATED_EVENT));
}

export function upsertDemoAdminProduct(product: Product) {
  const current = readDemoAdminProducts();
  const exists = current.some((item) => item.id === product.id);
  const next = exists
    ? current.map((item) => (item.id === product.id ? product : item))
    : [...current, product];

  writeDemoAdminProducts(next);
  return product;
}

export function deleteDemoAdminProduct(id: string) {
  const next = readDemoAdminProducts().filter((product) => product.id !== id);
  writeDemoAdminProducts(next);
}

export function resetDemoAdminProducts() {
  writeDemoAdminProducts(cloneDefaults());
}
