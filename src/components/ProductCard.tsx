"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice, getProductWhatsappUrl } from "@/lib/format";
import { localStoreSettings } from "@/data/store";

function getOfferTimer(endAt?: string) {
  if (!endAt) return null;

  const end = new Date(endAt);
  const remaining = Math.max(0, end.getTime() - Date.now());
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
  const [selectedColor, setSelectedColor] = useState(
    variants[0]?.name ?? product.colors[0] ?? "Default",
  );

  const selectedVariant =
    variants.find((variant) => variant.name === selectedColor) ?? variants[0];

  const currentImage = selectedVariant?.image ?? product.image;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const soldOut = product.status === "sold-out" || currentStock <= 0;
  const limitedStock = !soldOut && currentStock <= 7;
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

  const [offerTimer, setOfferTimer] = useState(() =>
    getOfferTimer(product.saleEndsAt),
  );

  useEffect(() => {
    if (!product.saleEndsAt) return;
    const update = () => setOfferTimer(getOfferTimer(product.saleEndsAt));
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [product.saleEndsAt]);

  const badge = useMemo(
    () =>
      soldOut
        ? "Sold out"
        : limitedStock
          ? `Limited stock · ${currentStock} left`
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
            <span className="product-card-discount">{discount}% OFF</span>
          ) : null}
        </div>
      </div>

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
