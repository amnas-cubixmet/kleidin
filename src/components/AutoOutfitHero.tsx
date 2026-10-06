"use client";

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
  backgroundImage: string;
  category: string;
  price: number;
  demo: boolean;
};

export function AutoOutfitHero({ products }: { products: Product[] }) {
  const items = useMemo<SliderItem[]>(() => {
    const imagePairs = [
      {
        foreground: "/images/product-1.png",
        background: "/images/bg-1.png",
      },
      {
        foreground: "/images/product-2.png",
        background: "/images/bg-2.png",
      },
    ];

    const activeProducts = products
      .filter((product) => product.status === "active")
      .slice(0, imagePairs.length);

    return imagePairs.map((pair, index) => {
      const product = activeProducts[index];

      return {
        id: product?.id || "demo-selector-" + index,
        name:
          product?.name ||
          (index === 0 ? "Essential White Tee" : "Daily White Tee"),
        slug: product?.slug || "",
        image: pair.foreground,
        backgroundImage: pair.background,
        category: product?.category || "T-Shirts",
        price: product?.price ?? 799,
        demo: !product,
      };
    });
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
    if (activeIndex < items.length) return;
    setActiveIndex(0);
  }, [activeIndex, items.length]);

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
        rail.scrollTo({
          left:
            thumb.offsetLeft -
            (rail.clientWidth - thumb.offsetWidth) / 2,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }

      if (!manual) return;

      setPaused(true);

      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
      }

      pauseTimerRef.current = window.setTimeout(() => {
        setPaused(false);
        pauseTimerRef.current = null;
      }, 4200);
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
          rail.scrollTo({
            left:
              thumb.offsetLeft -
              (rail.clientWidth - thumb.offsetWidth) / 2,
            behavior: "smooth",
          });
        }

        return next;
      });
    }, 4200);

    return () => window.clearInterval(timer);
  }, [items.length, paused, reducedMotion]);

  if (!active) return null;

  const activeHref = active.demo
    ? "/products"
    : "/products/" + active.slug;

  return (
    <section
      className="relative h-[100svh] w-screen overflow-hidden md:h-[100dvh]"
      aria-label="Product selector"
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
        }, 4200);
      }}
    >
      {active.backgroundImage ? (
        <>
          <div
            key={"background-" + active.id + "-" + activeIndex}
            className="selected-background absolute inset-0"
          >
            <img
              src={active.backgroundImage}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
        </>
      ) : null}

      <aside className="absolute left-0 top-0 z-20 flex h-[98px] w-full items-end px-5 pb-4 text-white sm:h-[112px] sm:px-7 sm:pb-5 lg:h-[calc(100%-112px)] lg:w-[24%] lg:items-start lg:px-8 lg:pt-9">
        <div>
          <p className="m-0 text-[9px] font-bold uppercase tracking-[.18em] text-white/70 drop-shadow">
            KLEID.IN / SELECT
          </p>
          <h2 className="mt-1.5 max-w-[240px] text-[27px] font-semibold leading-[.92] tracking-[-.055em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,.45)] sm:text-[34px] lg:mt-5 lg:text-[50px]">
            Find your match outfit.
          </h2>

          <p className="mt-6 hidden max-w-[220px] text-[11px] leading-5 text-white/55 lg:block">
            Select a product below to preview the product, price and details.
          </p>
        </div>
      </aside>

      <div className="absolute left-0 right-0 top-[98px] bottom-[112px] z-10 sm:top-[112px] lg:left-[24%] lg:top-0">
        <article
          key={"details-" + active.id + "-" + activeIndex}
          className="selected-product-details absolute bottom-4 left-4 right-4 z-30 border border-white/35 bg-black/25 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,.18)] backdrop-blur-xl sm:left-auto sm:right-5 sm:w-[280px] lg:bottom-auto lg:right-[14%] lg:top-[38%] lg:w-[270px] lg:-translate-y-1/2 lg:p-4 xl:right-[16%] xl:w-[285px]"
        >
          <p className="m-0 text-[8px] font-bold uppercase tracking-[.15em] text-white/65">
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

      <div className="absolute inset-x-0 bottom-0 z-40 h-[112px] border-t border-white/20 bg-black/30 backdrop-blur-xl">
        <div
          ref={railRef}
          className="flex h-full w-full snap-x snap-mandatory items-center gap-2 overflow-x-auto px-[38vw] [scrollbar-width:none] sm:gap-3 sm:px-[42vw] lg:px-4 [&::-webkit-scrollbar]:hidden"
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
                  "relative aspect-[4/5] h-[84px] shrink-0 snap-center overflow-hidden bg-black/20 transition-[transform,border-color,opacity,box-shadow] duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:h-[92px] " +
                  (selected
                    ? "z-10 scale-[1.06] border-2 border-[#001cac] opacity-100 shadow-[0_8px_22px_rgba(0,0,0,.18)]"
                    : "border border-white/20 opacity-70 hover:opacity-100")
                }
              >
                {product.backgroundImage ? (
                  <>
                    <img
                      src={product.backgroundImage}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <span className="absolute inset-0 bg-black/20" />
                  </>
                ) : null}
                <img
                  src={product.image}
                  alt=""
                  className="absolute inset-[8%] z-10 h-[84%] w-[84%] object-contain object-center"
                />
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .selected-background {
          animation: selectedBackgroundIn 900ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity;
        }

        .selected-product-stage {
          animation: selectedStageIn 700ms cubic-bezier(.16,1,.3,1) both;
        }

        .selected-product-image {
          animation: selectedImageIn 960ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity;
        }

        .selected-product-details {
          animation: selectedDetailsIn 720ms 100ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity, filter;
        }

        .selected-product-button {
          animation: selectedButtonIn 620ms 260ms cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes selectedBackgroundIn {
          from {
            opacity: 0;
            transform: scale(1.035);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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
          .selected-background,
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
