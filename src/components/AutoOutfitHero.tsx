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

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

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
    };
  }, []);

  const selectProduct = useCallback(
    (index: number, manual = false) => {
      if (!items.length) return;

      const next = ((index % items.length) + items.length) % items.length;
      setActiveIndex(next);

      const rail = railRef.current;
      const thumb = rail?.querySelector<HTMLElement>(
        '[data-product-thumb="' + next + '"]',
      );

      if (rail && thumb) {
        const left =
          thumb.offsetLeft - (rail.clientWidth - thumb.offsetWidth) / 2;

        rail.scrollTo({
          left,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }

      if (manual) {
        setPaused(true);

        if (pauseTimerRef.current !== null) {
          window.clearTimeout(pauseTimerRef.current);
        }

        pauseTimerRef.current = window.setTimeout(() => {
          setPaused(false);
          pauseTimerRef.current = null;
        }, 4000);
      }
    },
    [items.length, reducedMotion],
  );

  useEffect(() => {
    if (items.length <= 1 || reducedMotion || paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % items.length;
        const rail = railRef.current;
        const thumb = rail?.querySelector<HTMLElement>(
          '[data-product-thumb="' + next + '"]',
        );

        if (rail && thumb) {
          const left =
            thumb.offsetLeft - (rail.clientWidth - thumb.offsetWidth) / 2;
          rail.scrollTo({ left, behavior: "smooth" });
        }

        return next;
      });
    }, 3800);

    return () => window.clearInterval(timer);
  }, [items.length, paused, reducedMotion]);

  if (!active) return null;

  const activeHref = active.demo ? "/products" : "/products/" + active.slug;

  return (
    <section
      className="w-full bg-[#f2f2f0] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8"
      aria-label="Product selector"
    >
      <div
        className="relative mx-auto min-h-[690px] w-full max-w-[1440px] overflow-hidden bg-[#e9e7e2] sm:min-h-[760px] lg:min-h-[720px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
          setPaused(true);
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          const end = event.changedTouches[0]?.clientX;
          touchStartX.current = null;

          if (start !== null && end !== undefined) {
            const delta = end - start;
            if (Math.abs(delta) > 55) {
              selectProduct(
                activeIndex + (delta < 0 ? 1 : -1),
                true,
              );
            }
          }

          if (pauseTimerRef.current !== null) {
            window.clearTimeout(pauseTimerRef.current);
          }

          pauseTimerRef.current = window.setTimeout(() => {
            setPaused(false);
            pauseTimerRef.current = null;
          }, 4000);
        }}
      >
        <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-8 lg:left-10 lg:top-10">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[.16em] text-black/45">
            KLEID.IN / SELECT
          </p>
          <h2 className="mt-2 max-w-[220px] text-[28px] font-semibold leading-[.95] tracking-[-.055em] text-[#111] sm:text-[38px] lg:text-[46px]">
            Find your everyday fit.
          </h2>
        </div>

        <div className="absolute inset-x-0 top-[112px] bottom-[178px] sm:top-[120px] sm:bottom-[190px] lg:inset-y-0 lg:left-[20%] lg:right-[29%]">
          <div
            key={active.id + "-" + activeIndex}
            className="selected-product-stage absolute inset-0"
          >
            <Image
              src={active.image}
              alt={active.name}
              fill
              priority
              sizes="(max-width: 1023px) 86vw, 52vw"
              className="selected-product-image object-contain object-center p-4 sm:p-6 lg:p-8"
            />
          </div>
        </div>

        <article
          key={"details-" + active.id + "-" + activeIndex}
          className="selected-product-details absolute left-4 right-4 bottom-[116px] z-20 bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.12)] backdrop-blur-md sm:left-auto sm:right-6 sm:bottom-[132px] sm:w-[310px] sm:p-5 lg:right-10 lg:top-1/2 lg:bottom-auto lg:w-[320px] lg:-translate-y-1/2"
        >
          <p className="m-0 text-[8px] font-bold uppercase tracking-[.14em] text-black/40">
            {active.category}
          </p>

          <h3 className="mt-2 text-[20px] font-semibold leading-tight tracking-[-.035em] text-[#111] sm:text-[24px]">
            {active.name}
          </h3>

          <div className="mt-4 flex items-center justify-between gap-4">
            <strong className="text-[16px] font-semibold text-[#111]">
              {money(active.price)}
            </strong>

            <Link
              href={activeHref}
              className="selected-product-button inline-flex min-h-10 items-center justify-center bg-[#001cac] px-5 text-[9px] font-bold uppercase tracking-[.1em] !text-white transition hover:bg-[#00158a]"
            >
              View product
            </Link>
          </div>
        </article>

        <div className="absolute inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/92 p-2 backdrop-blur-md sm:p-3">
          <div
            ref={railRef}
            className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-[38vw] py-1 [scrollbar-width:none] sm:gap-3 sm:px-[42vw] lg:px-4 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((product, index) => {
              const selected = index === activeIndex;

              return (
                <button
                  key={product.id}
                  type="button"
                  data-product-thumb={index}
                  aria-label={"Select " + product.name}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => selectProduct(index, true)}
                  className={
                    "relative aspect-[4/5] w-[70px] shrink-0 snap-center overflow-hidden bg-[#f5f4f1] transition-[transform,border-color,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:w-[82px] lg:w-[88px] " +
                    (selected
                      ? "scale-[1.06] border-2 border-[#001cac] opacity-100"
                      : "border border-black/10 opacity-60 hover:opacity-100")
                  }
                >
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="88px"
                    className="object-contain object-center p-1.5"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[126px] left-5 z-20 hidden items-center gap-2 text-[8px] font-semibold uppercase tracking-[.12em] text-black/35 lg:flex">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-black/20" />
          <span>{String(items.length).padStart(2, "0")}</span>
        </div>
      </div>

      <style jsx>{`
        .selected-product-stage {
          animation: selectedStageIn 780ms cubic-bezier(.16,1,.3,1) both;
        }

        .selected-product-image {
          animation: selectedImageIn 980ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity;
        }

        .selected-product-details {
          animation: selectedDetailsIn 720ms 110ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity, filter;
        }

        .selected-product-button {
          animation: selectedButtonIn 620ms 260ms cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes selectedStageIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes selectedImageIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(.92);
          }
          70% {
            opacity: 1;
            transform: translateY(-3px) scale(1.025);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes selectedDetailsIn {
          from {
            opacity: 0;
            filter: blur(4px);
            transform: translateY(12px) scale(.97);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0) scale(1);
          }
        }

        @keyframes selectedButtonIn {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (min-width: 1024px) {
          @keyframes selectedDetailsIn {
            from {
              opacity: 0;
              filter: blur(4px);
              transform: translateY(calc(-50% + 12px)) scale(.97);
            }
            to {
              opacity: 1;
              filter: blur(0);
              transform: translateY(-50%) scale(1);
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .selected-product-stage,
          .selected-product-image,
          .selected-product-details,
          .selected-product-button {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
