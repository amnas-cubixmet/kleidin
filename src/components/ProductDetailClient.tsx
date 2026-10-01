"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatPrice, getProductWhatsappUrl } from "@/lib/format";

export function ProductDetailClient({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  const { addItem } = useCart();
  const variants = product.colorVariants ?? [];
  const [selectedColor, setSelectedColor] = useState(
    variants[0]?.name ?? product.colors[0] ?? "Default",
  );
  const [size, setSize] = useState(product.sizes[0] ?? "One size");
  const [added, setAdded] = useState(false);

  const selectedVariant =
    variants.find((variant) => variant.name === selectedColor) ?? variants[0];

  const image = selectedVariant?.image ?? product.image;
  const stock = selectedVariant?.stock ?? product.stock;
  const soldOut = product.status === "sold-out" || stock <= 0;
  const whatsappUrl = getProductWhatsappUrl(
    product,
    whatsappNumber,
    selectedColor,
    size,
  );

  function addToCart() {
    if (soldOut) return;

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image,
      size,
      color: selectedColor,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

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
              <strong>{formatPrice(product.price)}</strong>
              {product.compareAtPrice ? (
                <del>{formatPrice(product.compareAtPrice)}</del>
              ) : null}
            </div>
          </div>

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

          <div className="product-action-buttons product-detail-actions">
            <button
              type="button"
              className="button button-primary add-cart-button"
              disabled={soldOut}
              onClick={addToCart}
            >
              {soldOut ? "Sold out" : added ? "Added to cart" : "Add to Cart"}
            </button>

            {whatsappUrl !== "#" && !soldOut ? (
              <a
                className="button button-outline"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            ) : null}
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
