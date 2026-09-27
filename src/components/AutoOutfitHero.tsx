"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

const MODEL_PRIMARY = "/images/hero/model-black-tee.png";
const MODEL_FALLBACK =
  "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=90";

const GARMENT_ASSETS = [
  "/images/hero/black-shirt.png",
  "/images/hero/white-shirt.png",
  "/images/hero/blue-shirt.png",
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function GarmentLayer({
  src,
  state,
  index,
}: {
  src: string;
  state: "active" | "previous" | "next";
  index: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div
      className={`auto-garment-layer garment-${index} ${state}`}
      aria-hidden={state !== "active"}
    >
      {/* Generated transparent garment assets are intentionally rendered as a plain img. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="auto-garment-image"
        draggable={false}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function AutoOutfitHero({ products }: { products: Product[] }) {
  const items = useMemo(() => products.slice(0, 3), [products]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [modelSrc, setModelSrc] = useState(MODEL_PRIMARY);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();

    if (media.addEventListener) {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;

    let timer = 0;

    const start = () => {
      window.clearInterval(timer);
      if (document.hidden) return;

      timer = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % items.length);
      }, reducedMotion ? 4200 : 3000);
    };

    start();
    document.addEventListener("visibilitychange", start);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, [items.length, reducedMotion]);

  if (!items.length) return null;

  return (
    <section
      className={`auto-outfit-hero ${reducedMotion ? "reduced-motion" : ""}`}
      aria-label="Automatic KLEID.IN outfit showcase"
    >
      <div className="auto-outfit-shell">
        <div className="auto-outfit-copy">
          <p className="auto-outfit-kicker">KLEID.IN / LIVE EDIT</p>

          <div className="auto-outfit-copy-stack" aria-live="polite">
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
                  Shop this look <span>→</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="auto-outfit-nav" aria-label="Choose featured T-shirt">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modelSrc}
              alt="Model wearing the KLEID.IN edit"
              className="auto-model-base"
              draggable={false}
              onError={() => {
                if (modelSrc !== MODEL_FALLBACK) setModelSrc(MODEL_FALLBACK);
              }}
            />

            {items.map((product, index) => {
              const previousIndex =
                (activeIndex - 1 + items.length) % items.length;
              const state =
                index === activeIndex
                  ? "active"
                  : index === previousIndex
                    ? "previous"
                    : "next";

              return (
                <GarmentLayer
                  key={product.id}
                  src={GARMENT_ASSETS[index] ?? GARMENT_ASSETS[0]}
                  state={state}
                  index={index}
                />
              );
            })}

            <div className="auto-model-caption" aria-hidden="true">
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
