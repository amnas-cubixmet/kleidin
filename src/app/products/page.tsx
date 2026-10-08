import { getMongoEnvironment } from "@/lib/server-env";
import { HomeProductCatalog } from "@/components/HomeProductCatalog";
import { getCatalogProducts } from "@/lib/catalog";
import { homeDemoProducts } from "@/lib/home-demo-products";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function ProductsPage() {
  const catalog = await getCatalogProducts();
  const products = catalog.filter((product) => product.status !== "draft");
  return <HomeProductCatalog products={products.length ? products : getMongoEnvironment() ? [] : homeDemoProducts} eyebrow="KLEID.IN / COLLECTION" title="Shop everyday essentials" />;
}
