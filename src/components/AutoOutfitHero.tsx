"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

const MODEL_IMAGE =
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=90";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AutoOutfitHero({ products }: { products: Product[] }) {
  const items = useMemo(
    () => products.filter((product) => product.image || product.tryOnImage).slice(0, 5),
    [products],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMotionPreference = () => setReducedMotion(media.matches);
    syncMotionPreference();

    if (media.addEventListener) {
      media.addEventListener("change", syncMotionPreference);
      return () => media.removeEventListener("change", syncMotionPreference);
    }

    media.addListener(syncMotionPreference);
    return () => media.removeListener(syncMotionPreference);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;

    let timer = 0;

    const start = () => {
      window.clearInterval(timer);
      if (document.hidden) return;

      timer = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % items.length);
      }, reducedMotion ? 4200 : 3200);
    };

    const onVisibilityChange = () => start();

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [items.length, reducedMotion]);

  useEffect(() => {
    if (!items.length) return;

    const next = items[(activeIndex + 1) % items.length];
    const src = next?.tryOnImage || next?.image;
    if (!src) return;

    const preload = new window.Image();
    preload.src = src;
  }, [activeIndex, items]);

  if (!items.length) return null;

  const active = items[activeIndex] ?? items[0];

  return (
    <section
      className={`auto-outfit-hero ${reducedMotion ? "reduced-motion" : ""}`}
      aria-label="Automatic outfit showcase"
    >
      <div className="auto-outfit-shell">
        <div className="auto-outfit-copy" aria-live="polite">
          <p className="auto-outfit-kicker">KLEID.IN / LIVE EDIT</p>

          <div className="auto-outfit-copy-stack">
            {items.map((product, index) => (
              <div
                key={product.id}
                className={`auto-outfit-copy-item ${index === activeIndex ? "active" : ""}`}
                aria-hidden={index !== activeIndex}
              >
                <span className="auto-outfit-category">{product.category}</span>
                <h1>{product.name}</h1>
                <p>
                  {product.description ||
                    "A clean everyday piece selected for the current KLEID.IN edit."}
                </p>

                <div className="auto-outfit-meta">
                  <strong>{formatPrice(product.price)}</strong>
                  {product.colors?.length ? <span>{product.colors.join(" / ")}</span> : null}
                </div>

                <Link href={`/products/${product.slug}`} className="auto-outfit-cta">
                  View product <span>→</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="auto-outfit-nav" aria-label="Outfit selector">
            {items.map((product, index) => (
              <button
                key={product.id}
                type="button"
                className={index === activeIndex ? "active" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${product.name}`}
                aria-pressed={index === activeIndex}
              >
                <span />
              </button>
            ))}
          </div>
        </div>

        <div className="auto-outfit-visual">
          <div className="auto-model-stage">
            <Image
              src={MODEL_IMAGE}
              alt=""
              fill
              priority
              sizes="(max-width: 980px) 100vw, 55vw"
              className="auto-model-base"
            />

            <div className="auto-model-wash" aria-hidden="true" />

            {items.map((product, index) => {
              const garment = product.tryOnImage || product.image;
              if (!garment) return null;

              return (
                <div
                  key={product.id}
                  className={`auto-garment-layer ${index === activeIndex ? "active" : ""} ${
                    product.tryOnImage ? "try-on-ready" : "fallback-garment"
                  }`}
                  aria-hidden={index !== activeIndex}
                >
                  <Image
                    src={garment}
                    alt=""
                    fill
                    sizes="(max-width: 980px) 68vw, 32vw"
                    className="auto-garment-image"
                  />
                </div>
              );
            })}

            <div className="auto-model-caption">
              <span>{String(activeIndex + 1).padStart(2, "0")}</span>
              <span>/</span>
              <span>{String(items.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
