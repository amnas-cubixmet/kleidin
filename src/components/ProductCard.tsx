"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice, getProductWhatsappUrl } from "@/lib/format";
import { localStoreSettings } from "@/data/store";
import { getProductOfferPrice, isProductOfferActive } from "@/lib/product-offers";

function getOfferTimer(endAt: string | undefined, now: number) {
  if (!endAt) return null;

  const end = new Date(endAt);
  const remaining = Math.max(0, end.getTime() - now);
  if (remaining <= 0) return null;

  const totalMinutes = Math.floor(remaining / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return {
    countdown: `${String(days).padStart(2, "0")}D : ${String(hours).padStart(2, "0")}H : ${String(minutes).padStart(2, "0")}M`,
    date: end
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      .toUpperCase(),
  };
}

export function ProductCard({ product }: { product: Product }) {
  const variants = product.colorVariants ?? [];
  const [now, setNow] = useState(() => Date.now());
  const needsOfferClock = Boolean(
    (product.offerEnabled &&
      (product.offerStartsAt || product.offerEndsAt || product.offerCountdown)) ||
      product.saleEndsAt,
  );
  const [selectedColor, setSelectedColor] = useState(
    variants[0]?.name ?? product.colors[0] ?? "Default",
  );

  const selectedVariant =
    variants.find((variant) => variant.name === selectedColor) ?? variants[0];

  const currentImage = selectedVariant?.image ?? product.image;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const soldOut = product.status === "sold-out" || currentStock <= 0;
  const limitedStock = !soldOut && currentStock <= 7;
  const activeProductOffer = isProductOfferActive(product, now);
  const offerPrice = getProductOfferPrice(product, now);
  const legacyOffer =
    !activeProductOffer &&
    Boolean(product.compareAtPrice) &&
    Number(product.compareAtPrice) > product.price;
  const hasOffer = activeProductOffer || legacyOffer;
  const displayPrice = activeProductOffer ? offerPrice : product.price;
  const originalPrice = activeProductOffer
    ? product.price
    : product.compareAtPrice;

  const discount =
    hasOffer && originalPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  useEffect(() => {
    if (!needsOfferClock) return;

    const clock = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(clock);
  }, [needsOfferClock]);

  const offerEndAt =
    activeProductOffer && product.offerCountdown
      ? product.offerEndsAt
      : product.saleEndsAt;
  const offerTimer = getOfferTimer(offerEndAt, now);

  const badge = useMemo(
    () =>
      soldOut
        ? "Sold out"
        : limitedStock
          ? `Limited stock · ${currentStock} left`
          : activeProductOffer
            ? product.offerLabel ?? product.offerBadge ?? "Limited offer"
            : hasOffer
              ? product.saleLabel ?? "Limited offer"
            : product.featured
              ? "New"
              : product.category,
    [
      currentStock,
      hasOffer,
      limitedStock,
      product.category,
      product.featured,
      product.saleLabel,
      product.offerLabel,
      product.offerBadge,
      activeProductOffer,
      soldOut,
    ],
  );

  const whatsappHref = getProductWhatsappUrl(
    product,
    localStoreSettings.whatsappNumber,
    selectedColor,
  );

  return (
    <article className="product-card product-card-refined">
      <div className="product-visual product-card-visual-refined">
        <Link
          href={`/products/${product.slug}`}
          className="product-card-image-link"
          aria-label={product.name}
        >
          {currentImage ? (
            <Image
              key={currentImage}
              src={currentImage}
              alt={`${product.name} — ${selectedColor}`}
              fill
              sizes="(max-width: 600px) 50vw, (max-width: 980px) 50vw, 25vw"
              className="product-image product-card-image-refined"
            />
          ) : (
            <span className="product-image-empty">No image</span>
          )}
        </Link>

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

          {offerTimer ? (
            <span className="product-card-offer-timer">
              <small>ENDS {offerTimer.date}</small>
              <strong>{offerTimer.countdown}</strong>
            </span>
          ) : hasOffer && discount > 0 ? (
            <span className="product-card-discount">
              {activeProductOffer && product.offerBadge
                ? product.offerBadge
                : discount + "% OFF"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="product-card-info product-card-info-refined">
        <Link href={`/products/${product.slug}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-card-price">
          <strong>{formatPrice(displayPrice)}</strong>
          {hasOffer && originalPrice && originalPrice > displayPrice ? (
            <del>{formatPrice(originalPrice)}</del>
          ) : null}
        </div>

        <div className="product-card-stock-row">
          <span
            className={
              "product-card-stock-dot " +
              (soldOut ? "sold-out" : limitedStock ? "low-stock" : "in-stock")
            }
            aria-hidden="true"
          />
          <span>
            {soldOut
              ? "Sold out"
              : limitedStock
                ? `Low stock · ${currentStock}`
                : `In stock · ${currentStock}`}
          </span>
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
            aria-label={`Ask about ${product.name} in ${selectedColor} on WhatsApp`}
          >
            <span>Order on WhatsApp</span>
          </a>
        )}
      </div>
    </article>
  );
}
