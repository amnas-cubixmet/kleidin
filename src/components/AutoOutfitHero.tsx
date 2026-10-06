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
            (a.animationSortOrder ??
              a.featuredSortOrder ??
              a.sortOrder ??
              100) -
            (b.animationSortOrder ??
              b.featuredSortOrder ??
              b.sortOrder ??
              100),
        ),
    [products],
  );

  const railRef = useRef<HTMLDivElement | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
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
    return () => {
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const rail = railRef.current;
      if (!rail || !items.length) return;

      const next = ((index % items.length) + items.length) % items.length;
      const target = rail.querySelector<HTMLElement>(
        '[data-product-slide="' + next + '"]',
      );

      if (!target) return;

      rail.scrollTo({
        left: target.offsetLeft - rail.offsetLeft,
        behavior: reducedMotion ? "auto" : "smooth",
      });
      setActiveIndex(next);
    },
    [items.length, reducedMotion],
  );

  useEffect(() => {
    if (items.length <= 1 || reducedMotion || paused) return;

    const timer = window.setInterval(() => {
      scrollToIndex(activeIndex + 1);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [activeIndex, items.length, paused, reducedMotion, scrollToIndex]);

  function temporarilyPause() {
    setPaused(true);

    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = window.setTimeout(() => {
      setPaused(false);
      pauseTimerRef.current = null;
    }, 3500);
  }

  function syncActiveFromScroll() {
    const rail = railRef.current;
    if (!rail || !items.length) return;

    const railLeft = rail.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    rail.querySelectorAll<HTMLElement>("[data-product-slide]").forEach((node) => {
      const index = Number(node.dataset.productSlide ?? 0);
      const distance = Math.abs(node.getBoundingClientRect().left - railLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  if (!items.length) return null;

  return (
    <section
      className="w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12"
      aria-label="Featured products"
    >
      <div
        ref={railRef}
        onScroll={syncActiveFromScroll}
        onPointerDown={temporarilyPause}
        onTouchStart={temporarilyPause}
        onWheel={temporarilyPause}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 pr-[18vw] scroll-smooth overscroll-x-contain [scrollbar-width:none] sm:gap-4 sm:px-6 sm:pr-[12vw] lg:gap-5 lg:px-8 lg:pr-[8vw] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product, index) => {
          const isActive = index === activeIndex;

          return (
            <Link
              key={product.id}
              data-product-slide={index}
              href={"/products/" + product.slug}
              aria-label={"View " + product.name}
              className="group relative aspect-[4/5] w-[72vw] max-w-[360px] shrink-0 snap-start overflow-hidden bg-[#f2f2ef] sm:w-[42vw] md:w-[31vw] lg:w-[24vw] xl:w-[21vw]"
            >
              <div className="absolute inset-[5%] sm:inset-[6%]">
                <Image
                  src={getProductImage(product)}
                  alt={product.name}
                  fill
                  priority={index < 4}
                  sizes="(max-width: 639px) 72vw, (max-width: 767px) 42vw, (max-width: 1023px) 31vw, 24vw"
                  className={
                    "object-contain object-center transition-transform duration-500 ease-out " +
                    (isActive
                      ? "scale-[1.055]"
                      : "scale-100 group-hover:scale-[1.04]")
                  }
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
