import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { getWholesaleProductWhatsappUrl } from "@/lib/format";

export function WholesaleProductCard({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  const minOrder = product.wholesaleMinOrder ?? 12;
  const enquiryHref = getWholesaleProductWhatsappUrl(product, whatsappNumber);
  const soldOut = product.status === "sold-out" || product.stock <= 0;
  const wholesaleSlug = product.wholesaleSlug ?? `${product.slug}-dealer`;

  return (
    <article className="dealer-product-card dealer-product-card-clean">
      <Link
        href={`/wholesale/${wholesaleSlug}`}
        className="dealer-product-media"
        aria-label={product.name}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 980px) 33vw, 25vw"
            className="dealer-product-image"
          />
        ) : (
          <span className="dealer-product-empty">No image</span>
        )}

        <span className="dealer-product-stock-badge">
          {soldOut ? "Unavailable" : "Dealer order"}
        </span>
      </Link>

      <div className="dealer-product-info">
        <Link
          href={`/wholesale/${wholesaleSlug}`}
          className="dealer-product-name"
        >
          {product.name}
        </Link>

        <div className="dealer-product-minimum">
          <span>Minimum quantity</span>
          <strong>{minOrder} pcs</strong>
        </div>

        <div className="dealer-product-colour-list">
          <span>Colours</span>
          <div className="dealer-product-colours" aria-label="Available colours">
            {product.colors.map((colour) => (
              <span key={colour}>{colour}</span>
            ))}
          </div>
        </div>

        {soldOut || enquiryHref === "#" ? (
          <button
            type="button"
            className="dealer-enquiry-button is-disabled"
            disabled
          >
            {soldOut ? "Unavailable" : "WhatsApp unavailable"}
          </button>
        ) : (
          <a
            href={enquiryHref}
            target="_blank"
            rel="noreferrer"
            className="dealer-enquiry-button"
          >
            Enquire on WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
