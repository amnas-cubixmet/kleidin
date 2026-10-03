"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice, getProductWhatsappUrl } from "@/lib/format";
import { getProductOfferPrice, isProductOfferActive } from "@/lib/product-offers";

export function ProductDetailClient({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  const variants = product.colorVariants ?? [];
  const [now, setNow] = useState(() => Date.now());
  const [selectedColor, setSelectedColor] = useState(
    variants[0]?.name ?? product.colors[0] ?? "Default",
  );
  const [size, setSize] = useState(product.sizes[0] ?? "One size");

  const selectedVariant =
    variants.find((variant) => variant.name === selectedColor) ?? variants[0];

  const image = selectedVariant?.image ?? product.image;
  const stock = selectedVariant?.stock ?? product.stock;
  const soldOut = product.status === "sold-out" || stock <= 0;
  const offerActive = isProductOfferActive(product, now);
  const displayPrice = offerActive ? getProductOfferPrice(product, now) : product.price;
  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(clock);
  }, []);

  const whatsappUrl = getProductWhatsappUrl(
    product,
    whatsappNumber,
    selectedColor,
    size,
  );

  return (
    <>
      <div className="product-detail-visual">
        {image ? (
          <Image
            key={image}
            src={image}
            alt={`${product.name} — ${selectedColor}`}
            fill
            priority
            sizes="(max-width: 980px) 100vw, 58vw"
            className="product-detail-image"
          />
        ) : (
          <span className="product-detail-empty">No product image</span>
        )}

        <div className="product-detail-floating-tag">
          {soldOut ? "Sold out" : selectedColor}
        </div>
      </div>

      <div className="product-info">
        <div className="product-info-inner">
          <div className="product-detail-heading">
            <div>
              <p className="eyebrow">
                {product.category} / {product.sku}
              </p>
              <h1>{product.name}</h1>
            </div>

            <div className="product-detail-price">
              <strong>{formatPrice(displayPrice)}</strong>
              {offerActive ? (
                <del>{formatPrice(product.price)}</del>
              ) : product.compareAtPrice ? (
                <del>{formatPrice(product.compareAtPrice)}</del>
              ) : null}
            </div>
          </div>

          {offerActive ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#111111] px-3 py-1.5 text-[9px] font-bold text-white">
                {product.offerBadge || product.offerLabel || "Offer"}
              </span>
              {product.offerEndsAt ? (
                <span className="text-[9px] font-medium text-black/50">
                  Ends {new Date(product.offerEndsAt).toLocaleString("en-IN")}
                </span>
              ) : null}
            </div>
          ) : null}

          <p className="product-description">{product.description}</p>

          <div className="product-detail-option-block">
            <div className="product-detail-option-head">
              <span>Colour</span>
              <strong>{selectedColor}</strong>
            </div>

            {variants.length > 1 ? (
              <div className="product-detail-colour-swatches">
                {variants.map((variant) => (
                  <button
                    key={variant.name}
                    type="button"
                    className={
                      "product-detail-colour-swatch " +
                      (selectedColor === variant.name ? "active" : "")
                    }
                    onClick={() => setSelectedColor(variant.name)}
                  >
                    <span style={{ background: variant.value }} />
                    <small>{variant.name}</small>
                  </button>
                ))}
              </div>
            ) : (
              <strong className="product-single-colour">{selectedColor}</strong>
            )}
          </div>

          <div className="product-detail-option-block">
            <div className="product-detail-option-head">
              <span>Size</span>
              <strong>{size}</strong>
            </div>
            <div className="size-picker" aria-label="Select size">
              {product.sizes.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={size === option ? "active" : ""}
                  onClick={() => setSize(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="product-attribute-grid">
            <div>
              <span>Availability</span>
              <strong>{soldOut ? "Sold out" : `${stock} in stock`}</strong>
            </div>
            <div>
              <span>Selected</span>
              <strong>{selectedColor} / {size}</strong>
            </div>
          </div>

          <div className="product-action-buttons product-detail-actions product-detail-whatsapp-actions">
            {whatsappUrl !== "#" && !soldOut ? (
              <a
                className="button button-primary product-detail-whatsapp-primary"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                Order on WhatsApp
              </a>
            ) : (
              <button
                type="button"
                className="button button-primary product-detail-whatsapp-primary"
                disabled
              >
                {soldOut ? "Sold out" : "WhatsApp unavailable"}
              </button>
            )}
          </div>

          <div className="product-notes">
            <span>Colour-specific product image</span>
            <span>Selected colour + size sent to WhatsApp</span>
            <span>Variant stock supported</span>
          </div>
        </div>
      </div>
    </>
  );
}
