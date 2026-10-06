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
  background: string;
  demo: boolean;
};

const backgrounds = [
  "#d7d0c3",
  "#d6d8d2",
  "#d8d1ca",
  "#d2d7d5",
  "#d9d3c7",
  "#d3d6d9",
  "#dad5cf",
  "#d4d7cf",
];

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
      .slice(0, 8)
      .map((product, index) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: getProductImage(product),
        category: product.category,
        price: product.price,
        background: backgrounds[index % backgrounds.length],
        demo: false,
      }));

    const demoNames = [
      "Essential White Tee",
      "Daily Oversized Tee",
      "Everyday Relaxed Tee",
      "Core Cotton Tee",
      "KLEID.IN Daily Tee",
      "Classic Essential Tee",
      "Relaxed Everyday Tee",
      "Core Rotation Tee",
    ];

    if (liveItems.length >= 8) return liveItems;

    const fillers = Array.from(
      { length: Math.max(0, 8 - liveItems.length) },
      (_, fillerIndex) => {
        const index = liveItems.length + fillerIndex;

        return {
          id: "demo-slider-" + index,
          name: demoNames[index],
          slug: "",
          image: "/images/kleidin-white-shirt-model.png",
          category: "T-Shirts",
          price: 799,
          background: backgrounds[index % backgrounds.length],
          demo: true,
        };
      },
    );

    return [...liveItems, ...fillers];
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
        }, 4200);
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

          rail.scrollTo({
            left,
            behavior: reducedMotion ? "auto" : "smooth",
          });
        }

        return next;
      });
    }, 4200);

    return () => window.clearInterval(timer);
  }, [items.length, reducedMotion, paused]);

  if (!active) return null;

  const activeHref = active.demo ? "/products" : "/products/" + active.slug;

  return (
    <section
      className="w-full bg-[#efefed] px-2 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-7"
      aria-label="Product selector"
    >
      <div
        className="relative mx-auto min-h-[720px] w-full max-w-[1480px] overflow-hidden bg-[#cfc9bf] lg:min-h-[760px]"
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
              selectProduct(activeIndex + (delta < 0 ? 1 : -1), true);
            }
          }

          if (pauseTimerRef.current !== null) {
            window.clearTimeout(pauseTimerRef.current);
          }

          pauseTimerRef.current = window.setTimeout(() => {
            setPaused(false);
            pauseTimerRef.current = null;
          }, 4200);
        }}
      >
        <aside className="absolute left-0 top-0 z-20 flex h-[112px] w-full items-end bg-[#161514] px-5 pb-5 text-white sm:h-[128px] sm:px-7 sm:pb-6 lg:h-[calc(100%-122px)] lg:w-[25%] lg:items-start lg:px-9 lg:pt-10">
          <div>
            <p className="m-0 text-[9px] font-bold uppercase tracking-[.18em] text-white/45">
              KLEID.IN / SELECT
            </p>
            <h2 className="mt-2 max-w-[240px] text-[30px] font-semibold leading-[.92] tracking-[-.055em] sm:text-[38px] lg:mt-5 lg:text-[52px]">
              Find your match outfit.
            </h2>

            <div className="mt-6 hidden max-w-[220px] lg:block">
              <p className="text-[11px] leading-5 text-white/50">
                Select a product below and preview the fit, price and product details instantly.
              </p>
            </div>
          </div>
        </aside>

        <div
          className="absolute left-0 right-0 top-[112px] bottom-[122px] transition-colors duration-700 sm:top-[128px] lg:left-[25%] lg:top-0"
          style={{ backgroundColor: active.background }}
        >
          <div className="absolute inset-x-0 top-0 bottom-[150px] lg:bottom-0 lg:right-[28%]">
            <div
              key={active.id + "-" + activeIndex}
              className="selected-product-stage absolute inset-0"
            >
              <Image
                src={active.image}
                alt={active.name}
                fill
                priority
                sizes="(max-width: 1023px) 94vw, 48vw"
                className="selected-product-image object-contain object-center p-5 sm:p-7 lg:p-10"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute left-4 top-4 z-10 hidden items-center gap-2 sm:flex lg:left-7 lg:top-7">
            <span className="border border-black/15 bg-white/65 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[.12em] text-black/55 backdrop-blur">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/35">
              of {String(items.length).padStart(2, "0")}
            </span>
          </div>

          <article
            key={"details-" + active.id + "-" + activeIndex}
            className="selected-product-details absolute bottom-4 left-4 right-4 z-20 border border-white/40 bg-black/15 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,.12)] backdrop-blur-xl sm:left-auto sm:w-[300px] lg:bottom-auto lg:right-8 lg:top-1/2 lg:w-[320px] lg:-translate-y-1/2 lg:p-5"
          >
            <p className="m-0 text-[8px] font-bold uppercase tracking-[.15em] text-white/60">
              {active.category}
            </p>

            <h3 className="mt-2 text-[22px] font-semibold leading-[1] tracking-[-.04em] text-white sm:text-[26px]">
              {active.name}
            </h3>

            <div className="mt-4 border-t border-white/20 pt-4">
              <div className="flex items-center justify-between gap-4">
                <strong className="text-[17px] font-semibold">
                  {money(active.price)}
                </strong>

                <Link
                  href={activeHref}
                  className="selected-product-button inline-flex min-h-10 items-center justify-center bg-[#001cac] px-5 text-[9px] font-bold uppercase tracking-[.1em] !text-white transition hover:bg-[#00158a]"
                >
                  View product
                </Link>
              </div>
            </div>
          </article>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 h-[122px] border-t border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md">
          <div
            ref={railRef}
            className="flex h-full w-full snap-x snap-mandatory items-center gap-2 overflow-x-auto px-[38vw] [scrollbar-width:none] sm:gap-3 sm:px-[42vw] lg:px-3 [&::-webkit-scrollbar]:hidden"
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
                  style={{ backgroundColor: product.background }}
                  className={
                    "relative aspect-[4/5] h-[92px] shrink-0 snap-center overflow-hidden transition-[transform,border-color,opacity,box-shadow] duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:h-[98px] " +
                    (selected
                      ? "z-10 scale-[1.06] border-2 border-[#001cac] opacity-100 shadow-[0_8px_22px_rgba(0,0,0,.14)]"
                      : "border border-black/10 opacity-65 hover:opacity-100")
                  }
                >
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="86px"
                    className="object-contain object-center p-1.5"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .selected-product-stage {
          animation: selectedStageIn 760ms cubic-bezier(.16,1,.3,1) both;
        }

        .selected-product-image {
          animation: selectedImageIn 980ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity;
        }

        .selected-product-details {
          animation: selectedDetailsIn 720ms 100ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity, filter;
        }

        .selected-product-button {
          animation: selectedButtonIn 620ms 260ms cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes selectedStageIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes selectedImageIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(.91);
          }
          68% {
            opacity: 1;
            transform: translateY(-4px) scale(1.025);
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
            transform: translateY(14px) scale(.97);
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
              transform: translateY(calc(-50% + 14px)) scale(.97);
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
