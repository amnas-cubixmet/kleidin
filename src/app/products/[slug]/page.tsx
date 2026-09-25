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

  const whatsappUrl = settings.whatsappNumber
    ? getWhatsappUrl(product.name, settings.whatsappNumber)
    : undefined;

  const soldOut = product.status === "sold-out" || product.stock <= 0;

  return (
    <section className="product-page product-page-premium">
      <div className="product-detail-visual">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 980px) 100vw, 58vw"
            className="product-detail-image"
          />
        ) : (
          <span className="product-detail-empty">No product image</span>
        )}

        <div className="product-detail-floating-tag">
          {soldOut ? "Sold out" : product.category}
        </div>
      </div>

      <div className="product-info">
        <div className="product-info-inner">
          <Link href="/products" className="back-link">
            ← Shop
          </Link>

          <div className="product-detail-heading">
            <div>
              <p className="eyebrow">{product.category} / {product.sku}</p>
              <h1>{product.name}</h1>
            </div>

            <div className="product-detail-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.compareAtPrice ? (
                <del>{formatPrice(product.compareAtPrice)}</del>
              ) : null}
            </div>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-attribute-grid">
            <div>
              <span>Colour</span>
              <strong>{product.colors.join(" / ") || "Not set"}</strong>
            </div>
            <div>
              <span>Availability</span>
              <strong>{soldOut ? "Sold out" : `${product.stock} in stock`}</strong>
            </div>
          </div>

          <ProductActions product={product} whatsappUrl={whatsappUrl} />

          <div className="product-notes">
            <span>Secure WhatsApp ordering</span>
            <span>Size selection before adding to cart</span>
            <span>Live stock from the store catalog</span>
          </div>
        </div>
      </div>
    </section>
  );
}
