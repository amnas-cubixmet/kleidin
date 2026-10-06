"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product } from "@/types/product";
import {
  getProductOfferPrice,
  isProductOfferActive,
} from "@/lib/product-offers";

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
    product.colorVariants?.find((variant) => variant.images?.length)
      ?.images?.[0] ||
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
            product.featuredAnimationEnabled &&
            product.status === "active" &&
            Boolean(getProductImage(product)),
        )
        .sort(
          (a, b) =>
            (a.featuredSortOrder ?? a.sortOrder ?? 100) -
            (b.featuredSortOrder ?? b.sortOrder ?? 100),
        ),
    [products],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const touchStartX = useRef<number | null>(null);

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
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(clock);
  }, []);

  const goTo = useCallback(
    (nextIndex: number, nextDirection: 1 | -1) => {
      if (!items.length) return;

      const normalized =
        ((nextIndex % items.length) + items.length) % items.length;

      setDirection(nextDirection);
      setActiveIndex(normalized);
    },
    [items.length],
  );

  const next = useCallback(
    () => goTo(activeIndex + 1, 1),
    [activeIndex, goTo],
  );

  const previous = useCallback(
    () => goTo(activeIndex - 1, -1),
    [activeIndex, goTo],
  );

  useEffect(() => {
    if (
      items.length <= 1 ||
      reducedMotion ||
      paused ||
      document.hidden
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [items.length, paused, reducedMotion]);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!items.length) return null;

  const active = items[activeIndex] ?? items[0];
  const activeOffer = isProductOfferActive(active, now);
  const activePrice = activeOffer
    ? getProductOfferPrice(active, now)
    : active.price;

  return (
    <section
      className="w-full touch-pan-y overflow-hidden bg-[#fafafa]"
      aria-label="Product animation showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;

        if (start === null || end === undefined) return;

        const delta = end - start;
        if (Math.abs(delta) < 45) return;

        if (delta < 0) next();
        else previous();
      }}
    >
      <div className="mx-auto grid min-h-[660px] w-full max-w-[1440px] lg:grid-cols-[.82fr_1.18fr]">
        <div className="order-2 flex min-w-0 flex-col justify-center px-5 py-10 sm:px-8 lg:order-1 lg:px-14 lg:py-16">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="m-0 text-[9px] font-bold uppercase tracking-[.16em] text-[#001cac]">
                Product animation
              </p>
              <p className="mt-1 text-[10px] text-black/40">
                Enabled products only
              </p>
            </div>

            <span className="text-[9px] font-semibold tabular-nums text-black/45">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
          </div>

          <div className="relative min-h-[340px] sm:min-h-[360px]">
            {items.map((product, index) => {
              const isActive = index === activeIndex;
              const offerActive = isProductOfferActive(product, now);
              const price = offerActive
                ? getProductOfferPrice(product, now)
                : product.price;

              return (
                <article
                  key={product.id}
                  aria-hidden={!isActive}
                  className={
                    "absolute inset-0 flex flex-col justify-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,.61,.36,1)] " +
                    (isActive
                      ? "pointer-events-auto translate-x-0 opacity-100"
                      : direction > 0
                        ? "pointer-events-none -translate-x-6 opacity-0"
                        : "pointer-events-none translate-x-6 opacity-0")
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-semibold uppercase tracking-[.12em] text-black/45">
                      {product.category}
                    </span>

                    {offerActive ? (
                      <span className="rounded-full bg-[#001cac]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.08em] text-[#001cac]">
                        {product.offerBadge ||
                          product.offerLabel ||
                          "Offer"}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-3 max-w-[610px] text-[clamp(42px,7vw,92px)] font-semibold leading-[.88] tracking-[-.065em] text-[#111111]">
                    {product.name}
                  </h2>

                  {product.description ? (
                    <p className="mt-5 max-w-[500px] text-[12px] leading-6 text-black/55">
                      {product.description}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <strong className="text-[20px] font-semibold tracking-[-.03em] text-[#111111]">
                      {formatPrice(price)}
                    </strong>

                    {offerActive && product.price > price ? (
                      <del className="text-[11px] text-black/35">
                        {formatPrice(product.price)}
                      </del>
                    ) : null}

                    {product.colors?.length ? (
                      <span className="text-[9px] font-medium uppercase tracking-[.08em] text-black/45">
                        {product.colors.join(" / ")}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href={"/products/" + product.slug}
                      className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-full bg-[#111111] px-6 text-[10px] font-bold !text-white transition hover:bg-black"
                    >
                      View product
                    </Link>

                    <span className="text-[9px] font-medium uppercase tracking-[.08em] text-black/40">
                      {product.stock > 0
                        ? product.stock + " in stock"
                        : "Sold out"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex max-w-[60%] items-center gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  aria-label={"Show " + product.name}
                  aria-current={
                    index === activeIndex ? "true" : undefined
                  }
                  onClick={() =>
                    goTo(index, index >= activeIndex ? 1 : -1)
                  }
                  className={
                    "h-[3px] rounded-full transition-all duration-300 " +
                    (index === activeIndex
                      ? "w-10 bg-[#001cac]"
                      : "w-5 bg-black/15 hover:bg-black/30")
                  }
                />
              ))}
            </div>

            {items.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous product"
                  className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white text-lg transition hover:border-black/25"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next product"
                  className="grid h-11 w-11 place-items-center rounded-full bg-[#111] text-lg !text-white transition hover:bg-black"
                >
                  →
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative order-1 min-h-[58svh] overflow-hidden bg-[radial-gradient(circle_at_center,#ffffff_0%,#f4f4f2_58%,#e9e9e6_100%)] sm:min-h-[620px] lg:order-2 lg:min-h-[660px]">
          {items.map((product, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={product.id}
                className={
                  "absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,.61,.36,1)] " +
                  (isActive
                    ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
                    : direction > 0
                      ? "pointer-events-none translate-x-[7%] scale-[.985] opacity-0"
                      : "pointer-events-none -translate-x-[7%] scale-[.985] opacity-0")
                }
                aria-hidden={!isActive}
              >
                <div className="absolute inset-[5%] sm:inset-[7%] lg:inset-[8%]">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1023px) 90vw, 54vw"
                    className={
                      "object-contain object-center drop-shadow-[0_28px_36px_rgba(0,0,0,.12)] " +
                      (isActive && !reducedMotion
                        ? "animate-[productFloat_4.8s_ease-in-out_infinite]"
                        : "")
                    }
                  />
                </div>
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7 sm:right-7">
            <div className="rounded-full bg-white/90 px-3 py-2 text-[8px] font-bold uppercase tracking-[.1em] text-[#111111] backdrop-blur">
              Animation enabled
            </div>

            <div className="rounded-full bg-black/75 px-3 py-2 text-[8px] font-bold uppercase tracking-[.08em] text-white backdrop-blur">
              {active.name}
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Showing {active.name}, {formatPrice(activePrice)}
      </span>
    </section>
  );
}
