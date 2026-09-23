import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { getProductBySlug, products } from "@/data/products";
import { formatPrice, getWhatsappUrl } from "@/lib/format";
import { store } from "@/config/store";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product || product.status === "draft") notFound();

  const whatsappUrl = store.whatsappNumber
    ? getWhatsappUrl(product.name)
    : undefined;

  return (
    <section className="product-page">
      <div className="product-detail-visual">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 980px) 100vw, 56vw"
            className="product-detail-image"
          />
        ) : null}
      </div>

      <div className="product-info">
        <Link href="/products" className="back-link">
          ← Back to shop
        </Link>

        <p className="eyebrow">{product.category} / {product.sku}</p>
        <h1>{product.name}</h1>

        <div className="product-detail-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAtPrice ? (
            <del>{formatPrice(product.compareAtPrice)}</del>
          ) : null}
        </div>

        <p className="product-description">{product.description}</p>

        <div className="highlight-meta">
          <span>Colour</span>
          <strong>{product.colors.join(" / ")}</strong>
        </div>

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
