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
  const items = useMemo(() => {
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
        demo: false,
      }));

    if (liveItems.length > 0) return liveItems;

    return Array.from({ length: 6 }, (_, index) => ({
      id: "demo-slider-" + index,
      name: "KLEID.IN Essential",
      slug: "",
      image: "/images/kleidin-white-shirt-model.png",
      demo: true,
    }));
  }, [products]);

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

      const next = Math.max(0, Math.min(index, items.length - 1));
      const target = rail.querySelector<HTMLElement>(
        '[data-product-slide="' + next + '"]',
      );

      if (!target) return;

      const targetLeft =
        target.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2;

      rail.scrollTo({
        left: targetLeft,
        behavior: reducedMotion ? "auto" : "smooth",
      });
      setActiveIndex(next);
    },
    [items.length, reducedMotion],
  );

  useEffect(() => {
    if (
      items.length <= 1 ||
      reducedMotion ||
      paused ||
      activeIndex >= items.length - 1
    ) {
      return;
    }

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

    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + railRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    rail.querySelectorAll<HTMLElement>("[data-product-slide]").forEach((node) => {
      const index = Number(node.dataset.productSlide ?? 0);
      const rect = node.getBoundingClientRect();
      const nodeCenter = rect.left + rect.width / 2;
      const distance = Math.abs(nodeCenter - railCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  return (
    <section
      className="w-full overflow-hidden bg-white py-5 sm:py-6 lg:py-7"
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
        className="flex w-full snap-x snap-mandatory items-center gap-5 overflow-x-auto py-4 pl-[35vw] pr-[35vw] scroll-smooth overscroll-x-contain [scrollbar-width:none] sm:gap-7 sm:pl-[40vw] sm:pr-[40vw] md:pl-[42vw] md:pr-[42vw] lg:gap-9 lg:pl-[44vw] lg:pr-[44vw] xl:pl-[45vw] xl:pr-[45vw] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product, index) => {
          const isActive = index === activeIndex;

          return (
            <Link
              key={product.id}
              data-product-slide={index}
              href={product.demo ? "/products" : "/products/" + product.slug}
              aria-label={"View " + product.name}
              className="group relative aspect-[3/4] w-[30vw] max-w-[150px] shrink-0 snap-center overflow-visible sm:w-[20vw] sm:max-w-[165px] md:w-[16vw] md:max-w-[175px] lg:w-[12vw] lg:max-w-[185px] xl:w-[10vw] xl:max-w-[195px]"
            >
              <div className="absolute inset-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority={index < 4}
                  sizes="(max-width: 639px) 30vw, (max-width: 767px) 20vw, (max-width: 1023px) 16vw, 12vw"
                  className={
                    "object-contain object-center transition-transform duration-500 ease-out " +
                    (isActive ? "scale-[1.2]" : "scale-100")
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
