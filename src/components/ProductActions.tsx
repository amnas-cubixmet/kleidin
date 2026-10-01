"use client";

import { useState } from "react";
import type { Product } from "@/types/product";


type Props = {
  product: Product;
  whatsappUrl?: string;
  compact?: boolean;
};

export function ProductActions({
  product,
  whatsappUrl,
  compact = false,
}: Props) {
  const [size, setSize] = useState(product.sizes[0] ?? "One size");
  const [added, setAdded] = useState(false);
  const disabled = product.status !== "active" || product.stock <= 0;

  function addToCart() {
    if (disabled) return;


    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className={`product-actions ${compact ? "product-actions-compact" : ""}`}>
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

      <div className="product-action-buttons">
        <button
          type="button"
          className="button button-primary add-cart-button"
          disabled={disabled}
          onClick={addToCart}
        >
          {disabled ? "Sold out" : added ? "Added to cart" : "Add to Cart"}
        </button>

        {whatsappUrl && whatsappUrl !== "#" ? (
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
    </div>
  );
}
