import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { getCatalogProductBySlug } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { formatPrice, getWhatsappUrl } from "@/lib/format";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getCatalogProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product || product.status === "draft") notFound();

  const whatsappUrl = settings.whatsappNumber
    ? getWhatsappUrl(product.name, settings.whatsappNumber)
    : undefined;

  return (
    <section className="product-page">
      <div className="product-detail-visual">
        {product.image ? <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 980px) 100vw, 56vw" className="product-detail-image" /> : null}
      </div>

      <div className="product-info">
        <Link href="/products" className="back-link">← Back to shop</Link>
        <p className="eyebrow">{product.category} / {product.sku}</p>
        <h1>{product.name}</h1>

        <div className="product-detail-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAtPrice ? <del>{formatPrice(product.compareAtPrice)}</del> : null}
        </div>

        <p className="product-description">{product.description}</p>
        <div className="highlight-meta"><span>Colour</span><strong>{product.colors.join(" / ")}</strong></div>
        <ProductActions product={product} whatsappUrl={whatsappUrl} />

        <div className="product-notes">
          <span>Easy everyday fit</span>
          <span>Direct WhatsApp support</span>
          <span>Simple size selection</span>
        </div>
      </div>
    </section>
  );
}
