import { cache } from "react";
import { homeDemoProducts } from "@/lib/home-demo-products";
import { getStoreSettings } from "@/lib/site-settings";
import {
  applyHomepageOffer,
  getActiveHomepageOffer,
  getHomepageHeroCampaigns,
} from "@/lib/homepage-hero";
import { products as fallbackProducts } from "@/data/products";
import { getMongoEnvironment } from "@/lib/server-env";
import {
  getProductBySlug,
  getWholesaleProductBySlug as getWholesaleFromDb,
  listProducts,
} from "@/lib/mongodb-products";

export const getCatalogProducts = cache(async () => {
  const [products, settings, heroCampaigns] = await Promise.all([
    getMongoEnvironment()
      ? listProducts({ activeOnly: true })
      : Promise.resolve(
          fallbackProducts.filter((product) => product.status !== "draft"),
        ),
    getStoreSettings(),
    getHomepageHeroCampaigns(),
  ]);

  const offer = getActiveHomepageOffer(heroCampaigns);
  const merged = settings.demoProductsEnabled
    ? [
        ...products,
        ...homeDemoProducts.filter(
          (product) => !new Set(products.map((item) => item.slug)).has(product.slug),
        ),
      ]
    : products;

  return merged.map((product) => applyHomepageOffer(product, offer));
});

export const getCatalogProductBySlug = cache(async (slug: string) => {
  const [settings, heroCampaigns] = await Promise.all([
    getStoreSettings(),
    getHomepageHeroCampaigns(),
  ]);

  const realProduct = getMongoEnvironment()
    ? await getProductBySlug(slug)
    : fallbackProducts.find((product) => product.slug === slug) ?? null;

  const product =
    realProduct ??
    (settings.demoProductsEnabled
      ? homeDemoProducts.find((item) => item.slug === slug) ?? null
      : null);

  if (!product) return null;

  return applyHomepageOffer(
    product,
    getActiveHomepageOffer(heroCampaigns),
  );
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
