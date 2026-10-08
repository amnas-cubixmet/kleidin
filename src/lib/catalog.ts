import { cache } from "react";
import { products as fallbackProducts } from "@/data/products";
import { getMongoEnvironment } from "@/lib/server-env";
import {
  getProductBySlug,
  getWholesaleProductBySlug as getWholesaleFromDb,
  listProducts,
} from "@/lib/mongodb-products";

export const getCatalogProducts = cache(async () => {
  if (!getMongoEnvironment()) {
    return fallbackProducts.filter((product) => product.status !== "draft");
  }

  return listProducts({ activeOnly: true });
});

export const getCatalogProductBySlug = cache(async (slug: string) => {
  if (!getMongoEnvironment()) {
    return (
      fallbackProducts.find(
        (product) => product.slug === slug && product.status !== "draft",
      ) ?? null
    );
  }

  return getProductBySlug(slug);
});

export const getWholesaleProductBySlug = cache(async (slug: string) => {
  if (!getMongoEnvironment()) {
    return (
      fallbackProducts.find(
        (product) =>
          product.wholesaleEnabled &&
          (product.wholesaleSlug ?? product.slug + "-dealer") === slug &&
          product.status !== "draft",
      ) ?? null
    );
  }

  return getWholesaleFromDb(slug);
});
