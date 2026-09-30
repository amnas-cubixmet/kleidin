import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice, getProductWhatsappUrl } from "@/lib/format";
import { localStoreSettings } from "@/data/store";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.status === "sold-out" || product.stock <= 0;
  const limitedStock = !soldOut && product.stock <= 7;
  const hasOffer =
    Boolean(product.compareAtPrice) &&
    Number(product.compareAtPrice) > product.price;

  const discount =
    hasOffer && product.compareAtPrice
      ? Math.round(
          ((product.compareAtPrice - product.price) /
            product.compareAtPrice) *
            100,
        )
      : 0;

  const badge = soldOut
    ? "Sold out"
    : limitedStock
      ? `Limited stock · ${product.stock} left`
      : hasOffer
        ? "Limited offer"
        : product.featured
          ? "New"
          : product.category;

  const whatsappHref = getProductWhatsappUrl(
    product,
    localStoreSettings.whatsappNumber,
  );

  return (
    <article className="product-card product-card-refined">
      <Link
        href={`/products/${product.slug}`}
        className="product-visual product-card-visual-refined"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 980px) 50vw, 25vw"
            className="product-image product-card-image-refined"
          />
        ) : (
          <span className="product-image-empty">No image</span>
        )}

        <div className="product-card-badges">
          <span
            className={
              "product-card-status " +
              (soldOut
                ? "is-sold-out"
                : limitedStock
                  ? "is-limited"
                  : hasOffer
                    ? "is-offer"
                    : "")
            }
          >
            {badge}
          </span>

          {hasOffer && discount > 0 ? (
            <span className="product-card-discount">{discount}% OFF</span>
          ) : null}
        </div>
      </Link>

      <div className="product-card-info product-card-info-refined">
        <div className="product-card-topline product-card-main-row">
          <Link href={`/products/${product.slug}`} className="product-name">
            {product.name}
          </Link>

          <div className="product-card-price">
            <strong>{formatPrice(product.price)}</strong>
            {hasOffer && product.compareAtPrice ? (
              <del>{formatPrice(product.compareAtPrice)}</del>
            ) : null}
          </div>
        </div>

        <div className="product-card-bottomline product-card-meta-refined">
          <span>{product.colors.join(" / ") || "Colour not set"}</span>
          <span>{soldOut ? "Out of stock" : `Stock ${product.stock}`}</span>
        </div>

        {soldOut || whatsappHref === "#" ? (
          <button
            type="button"
            className="product-whatsapp-cta is-disabled"
            disabled
          >
            {soldOut ? "Sold out" : "WhatsApp unavailable"}
          </button>
        ) : (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="product-whatsapp-cta"
            aria-label={`Ask about ${product.name} on WhatsApp`}
          >
            <span>Order on WhatsApp</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
