import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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

  const canOrder = product.status === "active" && product.stock > 0;
  const whatsappConfigured = Boolean(store.whatsappNumber);

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
        <div className="product-detail-overlay">
          <p>{product.category}</p>
          <h1>{product.name}</h1>
        </div>
      </div>

      <div className="product-info">
        <Link href="/products" className="back-link">
          ← Back to shop
        </Link>

        <p className="eyebrow">{product.sku}</p>
        <h2>{product.name}</h2>

        <div className="product-detail-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAtPrice ? (
            <del>{formatPrice(product.compareAtPrice)}</del>
          ) : null}
        </div>

        <p className="product-description">{product.description}</p>

        <div className="option-block">
          <span>Sizes</span>
          <div className="option-list">
            {product.sizes.map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        </div>

        <div className="option-block">
          <span>Colour</span>
          <div className="option-list">
            {product.colors.map((color) => (
              <span key={color}>{color}</span>
            ))}
          </div>
        </div>

        <div className="stock-line">
          {canOrder ? `In stock · ${product.stock} available` : "Sold out"}
        </div>

        <a
          href={canOrder && whatsappConfigured ? getWhatsappUrl(product.name) : "#"}
          className={`button button-dark order-button ${
            !canOrder || !whatsappConfigured ? "button-disabled" : ""
          }`}
          aria-disabled={!canOrder || !whatsappConfigured}
          target={canOrder && whatsappConfigured ? "_blank" : undefined}
          rel={canOrder && whatsappConfigured ? "noreferrer" : undefined}
        >
          {!canOrder
            ? "Sold out"
            : whatsappConfigured
              ? "Order on WhatsApp"
              : "WhatsApp setup required"}
        </a>
      </div>
    </section>
  );
}
