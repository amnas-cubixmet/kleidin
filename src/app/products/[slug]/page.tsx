import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { getCatalogProductBySlug } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getCatalogProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product || product.status === "draft") notFound();

  return (
    <section className="product-page product-page-premium">
      <ProductDetailClient
        product={product}
        whatsappNumber={settings.whatsappNumber}
      />
    </section>
  );
}
