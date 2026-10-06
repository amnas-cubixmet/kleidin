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

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

type SliderItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  price: number;
  demo: boolean;
};

export function AutoOutfitHero({ products }: { products: Product[] }) {
  const items = useMemo<SliderItem[]>(() => {
    const liveItems = products
      .filter(
        (product) =>
          product.status === "active" && Boolean(getProductImage(product)),
      )
      .sort(
        (a, b) =>
          (a.sortOrder ?? a.featuredSortOrder ?? 100) -
          (b.sortOrder ?? b.featuredSortOrder ?? 100),
      )
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: getProductImage(product),
        category: product.category,
        price: product.price,
        demo: false,
      }));

    if (liveItems.length) return liveItems;

    return [
      "Essential White Tee",
      "Daily Oversized Tee",
      "Everyday Relaxed Tee",
      "Core Cotton Tee",
      "KLEID.IN Daily Tee",
      "Classic Essential Tee",
    ].map((name, index) => ({
      id: "demo-slider-" + index,
      name,
      slug: "",
      image: "/images/kleidin-white-shirt-model.png",
      category: "T-Shirts",
      price: 799,
      demo: true,
    }));
  }, [products]);

  const loopItems = useMemo(
    () =>
      items.length > 1
        ? [...items, ...items, ...items]
        : items,
    [items],
  );

  const railRef = useRef<HTMLDivElement | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeLoopIndex, setActiveLoopIndex] = useState(
    items.length > 1 ? items.length : 0,
  );
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const active = items[activeIndex] ?? items[0];

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
    return () => {
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
      }
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  const centerLoopIndex = useCallback(
    (loopIndex: number, behavior: ScrollBehavior = "smooth") => {
      const rail = railRef.current;
      if (!rail || !loopItems.length) return;

      const target = rail.querySelector<HTMLElement>(
        '[data-loop-slide="' + loopIndex + '"]',
      );
      if (!target) return;

      const targetLeft =
        target.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2;

      rail.scrollTo({ left: targetLeft, behavior });

      const baseIndex = items.length ? loopIndex % items.length : 0;
      setActiveLoopIndex(loopIndex);
      setActiveIndex(baseIndex);
    },
    [items.length, loopItems.length],
  );

  useEffect(() => {
    if (!items.length) return;

    const startIndex = items.length > 1 ? items.length : 0;
    const frame = window.requestAnimationFrame(() => {
      centerLoopIndex(startIndex, "auto");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [centerLoopIndex, items.length]);

  useEffect(() => {
    if (items.length <= 1 || reducedMotion || paused) return;

    const timer = window.setInterval(() => {
      const next = activeLoopIndex + 1;
      centerLoopIndex(next, "smooth");

      if (next >= items.length * 2) {
        if (resetTimerRef.current !== null) {
          window.clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = window.setTimeout(() => {
          centerLoopIndex(items.length, "auto");
          resetTimerRef.current = null;
        }, 720);
      }
    }, 2600);

    return () => window.clearInterval(timer);
  }, [
    activeLoopIndex,
    centerLoopIndex,
    items.length,
    paused,
    reducedMotion,
  ]);

  function temporarilyPause() {
    setPaused(true);

    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = window.setTimeout(() => {
      setPaused(false);
      pauseTimerRef.current = null;
    }, 3200);
  }

  function normalizeManualPosition(loopIndex: number) {
    if (items.length <= 1) return;

    let normalized = loopIndex;

    if (loopIndex < items.length) {
      normalized = loopIndex + items.length;
    } else if (loopIndex >= items.length * 2) {
      normalized = loopIndex - items.length;
    }

    if (normalized !== loopIndex) {
      centerLoopIndex(normalized, "auto");
    }
  }

  function syncActiveFromScroll() {
    const rail = railRef.current;
    if (!rail || !items.length) return;

    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + railRect.width / 2;
    let closestLoopIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    rail.querySelectorAll<HTMLElement>("[data-loop-slide]").forEach((node) => {
      const loopIndex = Number(node.dataset.loopSlide ?? 0);
      const rect = node.getBoundingClientRect();
      const nodeCenter = rect.left + rect.width / 2;
      const distance = Math.abs(nodeCenter - railCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLoopIndex = loopIndex;
      }
    });

    setActiveLoopIndex(closestLoopIndex);
    setActiveIndex(closestLoopIndex % items.length);

    if (scrollEndTimerRef.current !== null) {
      window.clearTimeout(scrollEndTimerRef.current);
    }

    scrollEndTimerRef.current = window.setTimeout(() => {
      normalizeManualPosition(closestLoopIndex);
      scrollEndTimerRef.current = null;
    }, 180);
  }

  if (!active) return null;

  return (
    <section
      className="w-full overflow-hidden bg-white py-5 sm:py-6 lg:py-7"
      aria-label="All products"
    >
      <div
        ref={railRef}
        onScroll={syncActiveFromScroll}
        onPointerDown={temporarilyPause}
        onTouchStart={temporarilyPause}
        onWheel={temporarilyPause}
        className="flex w-full snap-x snap-mandatory items-center gap-5 overflow-x-auto py-6 pl-[35vw] pr-[35vw] scroll-smooth overscroll-x-contain [scrollbar-width:none] sm:gap-7 sm:pl-[40vw] sm:pr-[40vw] md:pl-[42vw] md:pr-[42vw] lg:gap-9 lg:pl-[44vw] lg:pr-[44vw] xl:pl-[45vw] xl:pr-[45vw] [&::-webkit-scrollbar]:hidden"
      >
        {loopItems.map((product, loopIndex) => {
          const isActive = loopIndex === activeLoopIndex;

          return (
            <Link
              key={product.id + "-" + loopIndex}
              data-loop-slide={loopIndex}
              href={product.demo ? "/products" : "/products/" + product.slug}
              aria-label={"View " + product.name}
              className="group relative aspect-[3/4] w-[30vw] max-w-[150px] shrink-0 snap-center overflow-visible sm:w-[20vw] sm:max-w-[165px] md:w-[16vw] md:max-w-[175px] lg:w-[12vw] lg:max-w-[185px] xl:w-[10vw] xl:max-w-[195px]"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority={loopIndex >= items.length && loopIndex < items.length + 4}
                sizes="(max-width: 639px) 30vw, (max-width: 767px) 20vw, (max-width: 1023px) 16vw, 12vw"
                className={
                  "object-contain object-center transition-[transform,filter,opacity] duration-700 ease-[cubic-bezier(.22,.61,.36,1)] " +
                  (isActive
                    ? "z-10 scale-[1.24] opacity-100 drop-shadow-[0_18px_24px_rgba(0,0,0,.14)]"
                    : "scale-100 opacity-55")
                }
              />
            </Link>
          );
        })}
      </div>

      <div className="mx-auto mt-3 flex min-h-[132px] w-full max-w-[520px] items-start justify-center px-4">
        <article
          key={active.id + "-" + activeLoopIndex}
          className="active-product-pop w-full border border-black/10 bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,.08)] sm:p-5"
        >
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="m-0 text-[9px] font-bold uppercase tracking-[.14em] text-black/40">
                {active.category}
              </p>
              <h3 className="mt-1 truncate text-[18px] font-semibold tracking-[-.03em] text-[#111] sm:text-[20px]">
                {active.name}
              </h3>
              <p className="mt-2 text-[13px] font-semibold text-[#111]">
                {money(active.price)}
              </p>
            </div>

            <Link
              href={active.demo ? "/products" : "/products/" + active.slug}
              className="inline-flex min-h-10 shrink-0 items-center justify-center bg-[#001cac] px-4 text-[9px] font-bold uppercase tracking-[.1em] !text-white transition hover:bg-[#00158a]"
            >
              View product
            </Link>
          </div>
        </article>
      </div>

      <style jsx>{`
        .active-product-pop {
          animation: activeProductPop 520ms cubic-bezier(.22,.61,.36,1) both;
        }

        @keyframes activeProductPop {
          from {
            opacity: 0;
            transform: translateY(14px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
