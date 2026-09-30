"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

function discountPercent(product: Product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}

function getRemaining(endAt?: string) {
  if (!endAt) return null;

  const ms = Math.max(0, new Date(endAt).getTime() - Date.now());
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (ms <= 0) return null;
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h ${minutes}m left`;
}

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.status === "sold-out" || product.stock <= 0;
  const limitedStock = !soldOut && product.stock <= 7;
  const discount = discountPercent(product);
  const [remaining, setRemaining] = useState(() => getRemaining(product.saleEndsAt));

  useEffect(() => {
    if (!product.saleEndsAt) return;

    const update = () => setRemaining(getRemaining(product.saleEndsAt));
    update();
    const timer = window.setInterval(update, 60000);

    return () => window.clearInterval(timer);
  }, [product.saleEndsAt]);

  const statusLabel = useMemo(() => {
    if (soldOut) return "Sold out";
    if (limitedStock) return `Only ${product.stock} left`;
    if (discount > 0) return `${discount}% OFF`;
    if (product.featured) return "New";
    return product.category;
  }, [discount, limitedStock, product.category, product.featured, product.stock, soldOut]);

  return (
    <article className="product-card catalog-product-card">
      <Link href={`/products/${product.slug}`} className="product-visual catalog-product-visual">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 980px) 33vw, 25vw"
            className="product-image catalog-product-image"
          />
        ) : (
          <span className="product-image-empty">No image</span>
        )}

        <div className="catalog-badge-stack">
          <span
            className={
              "catalog-status-badge " +
              (soldOut
                ? "sold-out"
                : limitedStock
                  ? "limited"
                  : discount > 0
                    ? "discount"
                    : "")
            }
          >
            {statusLabel}
          </span>

          {remaining ? (
            <span className="catalog-timer-badge">
              <span>{product.saleLabel ?? "Timed offer"}</span>
              <strong>{remaining}</strong>
            </span>
          ) : null}
        </div>
      </Link>

      <div className="product-card-info catalog-card-info">
        <div className="catalog-card-title-row">
          <Link href={`/products/${product.slug}`} className="product-name">
            {product.name}
          </Link>
          <span className="catalog-stock-text">
            {soldOut ? "Stock [0]" : `Stock [${product.stock}]`}
          </span>
        </div>

        <div className="catalog-price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAtPrice ? (
            <del>{formatPrice(product.compareAtPrice)}</del>
          ) : null}
          {discount > 0 ? <span>[{discount}%]</span> : null}
        </div>

        <div className="product-card-bottomline catalog-card-meta">
          <span>{product.colors.join(" / ") || "Colour not set"}</span>
          <span>{product.sizes.join(" · ") || "Size not set"}</span>
        </div>

        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
