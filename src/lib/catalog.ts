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

  try {
    return await listProducts({ activeOnly: true });
  } catch {
    return fallbackProducts.filter((product) => product.status !== "draft");
  }
});

export const getCatalogProductBySlug = cache(async (slug: string) => {
  if (!getMongoEnvironment()) {
    return (
      fallbackProducts.find(
        (product) => product.slug === slug && product.status !== "draft",
      ) ?? null
    );
  }

  try {
    return await getProductBySlug(slug);
  } catch {
    return (
      fallbackProducts.find(
        (product) => product.slug === slug && product.status !== "draft",
      ) ?? null
    );
  }
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

  try {
    return await getWholesaleFromDb(slug);
  } catch {
    return (
      fallbackProducts.find(
        (product) =>
          product.wholesaleEnabled &&
          (product.wholesaleSlug ?? product.slug + "-dealer") === slug &&
          product.status !== "draft",
      ) ?? null
    );
  }
});
