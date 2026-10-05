"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductImage(product: Product) {
  return (
    product.featuredImage ||
    product.image ||
    product.colorVariants?.find((variant) => variant.images?.length)?.images?.[0] ||
    product.colorVariants?.find((variant) => variant.image)?.image ||
    ""
  );
}

export function AutoOutfitHero({ products }: { products: Product[] }) {
  const items = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.featured &&
            product.featuredAnimationEnabled &&
            product.status === "active" &&
            Boolean(getProductImage(product)),
        )
        .slice(0, 4),
    [products],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

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
    if (activeIndex >= items.length) setActiveIndex(0);
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (items.length <= 1 || reducedMotion) return;

    let timer = 0;

    const start = () => {
      window.clearInterval(timer);
      if (document.hidden) return;

      timer = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % items.length);
      }, 4200);
    };

    start();
    document.addEventListener("visibilitychange", start);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, [items.length, reducedMotion]);

  if (!items.length) return null;

  const active = items[activeIndex] ?? items[0];

  return (
    <section className="w-full overflow-hidden bg-[#fafafa]" aria-label="Featured products">
      <div className="mx-auto grid min-h-[680px] w-full max-w-[1440px] lg:grid-cols-[.82fr_1.18fr]">
        <div className="order-2 flex min-w-0 flex-col justify-center px-5 py-10 sm:px-8 lg:order-1 lg:px-14 lg:py-16">
          <div className="mb-7 flex items-center justify-between gap-4">
            <p className="m-0 text-[9px] font-bold uppercase tracking-[.16em] text-[#001cac]">
              Featured
            </p>
            <span className="text-[9px] font-semibold tabular-nums text-black/45">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
          </div>

          <div className="relative min-h-[330px] sm:min-h-[350px]">
            {items.map((product, index) => (
              <article
                key={product.id}
                aria-hidden={index !== activeIndex}
                className={
                  "absolute inset-0 flex flex-col justify-center transition-all duration-500 " +
                  (index === activeIndex
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-3 opacity-0")
                }
              >
                <span className="text-[9px] font-semibold uppercase tracking-[.12em] text-black/45">
                  {product.category}
                </span>

                <h2 className="mt-3 max-w-[610px] text-[clamp(44px,7vw,92px)] font-semibold leading-[.88] tracking-[-.065em] text-[#111111]">
                  {product.name}
                </h2>

                {product.description ? (
                  <p className="mt-5 max-w-[500px] text-[12px] leading-6 text-black/55">
                    {product.description}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <strong className="text-[20px] font-semibold tracking-[-.03em] text-[#111111]">
                    {formatPrice(product.price)}
                  </strong>
                  {product.colors?.length ? (
                    <span className="text-[9px] font-medium uppercase tracking-[.08em] text-black/45">
                      {product.colors.join(" / ")}
                    </span>
                  ) : null}
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  className="mt-7 inline-flex min-h-[46px] w-fit items-center justify-center rounded-full bg-[#111111] px-6 text-[10px] font-bold text-white transition hover:bg-black"
                >
                  View featured item
                </Link>
              </article>
            ))}
          </div>

          {items.length > 1 ? (
            <div className="mt-7 flex items-center gap-2" aria-label="Featured product navigation">
              {items.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  aria-label={`Show ${product.name}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={
                    "h-[3px] rounded-full transition-all duration-300 " +
                    (index === activeIndex
                      ? "w-10 bg-[#001cac]"
                      : "w-5 bg-black/15 hover:bg-black/30")
                  }
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative order-1 min-h-[58svh] overflow-hidden bg-[#ededeb] sm:min-h-[640px] lg:order-2 lg:min-h-[680px]">
          {items.map((product, index) => (
            <div
              key={product.id}
              className={
                "absolute inset-0 transition-[opacity,transform] duration-700 ease-out " +
                (index === activeIndex
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-[1.015] opacity-0")
              }
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={getProductImage(product)}
                alt={product.name}
                fill
                priority={index === 0}
                sizes="(max-width: 1023px) 100vw, 60vw"
                className="object-cover object-center"
              />
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-2 text-[8px] font-bold uppercase tracking-[.1em] text-[#111111] backdrop-blur sm:bottom-7 sm:left-7">
            Homepage featured
          </div>
        </div>
      </div>
    </section>
  );
}
