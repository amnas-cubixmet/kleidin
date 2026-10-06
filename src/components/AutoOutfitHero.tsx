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
    const localPairs = [
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
      .filter(
        (product) =>
          product.status === "active" && Boolean(getProductImage(product)),
      )
      .slice(0, 20);

    if (!activeProducts.length) {
      return localPairs.map((pair, index) => ({
        id: "demo-selector-" + index,
        name: index === 0 ? "Essential White Tee" : "Daily White Tee",
        slug: "",
        image: pair.foreground,
        backgroundImage: pair.background,
        category: "T-Shirts",
        price: 799,
        demo: true,
      }));
    }

    return activeProducts.map((product, index) => {
      const localPair = localPairs[index];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: localPair?.foreground || getProductImage(product),
        backgroundImage:
          localPair?.background || product.showcaseBackgroundImage || "",
        category: product.category,
        price: product.price,
        demo: false,
      };
    });
  }, [products]);

  const railProducts = useMemo(
    () =>
      items.slice(0, 20).map((product, index) => ({
        ...product,
        railId: "rail-" + index,
        baseIndex: index,
      })),
    [items],
  );

  const heroShowcaseCount = Math.min(items.length, 8);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);
  const railInteractingRef = useRef(false);
  const railFrameRef = useRef<number | null>(null);
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
      if (railFrameRef.current !== null) {
        window.cancelAnimationFrame(railFrameRef.current);
      }
    };
  }, []);

  const selectProduct = useCallback(
    (index: number, manual = false) => {
      if (!items.length) return;

      const next = ((index % items.length) + items.length) % items.length;
      setActiveIndex(next);

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
    [items.length],
  );

  useEffect(() => {
    if (heroShowcaseCount <= 1 || reducedMotion || paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const normalized =
          current >= heroShowcaseCount ? 0 : current;
        return (normalized + 1) % heroShowcaseCount;
      });
    }, 4200);

    return () => window.clearInterval(timer);
  }, [heroShowcaseCount, paused, reducedMotion]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || reducedMotion || !railProducts.length) return;

    const setWidth = () => rail.scrollWidth / 3;

    const initialize = window.requestAnimationFrame(() => {
      const width = setWidth();
      if (width > 0) rail.scrollLeft = width;
    });

    const tick = () => {
      const width = setWidth();

      if (!railInteractingRef.current && width > 0) {
        rail.scrollLeft += 0.26;

        if (rail.scrollLeft >= width * 2) {
          rail.scrollLeft -= width;
        } else if (rail.scrollLeft <= 0) {
          rail.scrollLeft += width;
        }
      }

      railFrameRef.current = window.requestAnimationFrame(tick);
    };

    railFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(initialize);
      if (railFrameRef.current !== null) {
        window.cancelAnimationFrame(railFrameRef.current);
        railFrameRef.current = null;
      }
    };
  }, [railProducts.length, reducedMotion]);

  if (!active) return null;

  const activeHref = active.demo
    ? "/products"
    : "/products/" + active.slug;
  const tryOnHref = active.demo
    ? "/products"
    : "/try-on/" + active.slug;

  return (
    <section
      className="relative h-[100svh] min-h-[100svh] w-screen overflow-hidden md:h-[100dvh] md:min-h-[100dvh]"
      aria-label="Product selector"
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
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
        </>
      ) : null}

      <div className="absolute inset-x-0 top-0 bottom-0 z-20">
        <aside className="absolute right-4 top-4 z-30 w-[210px] border border-white/35 bg-black/25 p-3 text-white shadow-[0_14px_34px_rgba(0,0,0,.16)] backdrop-blur-xl sm:right-6 sm:top-6 sm:w-[238px] sm:p-4 lg:right-[8%] lg:top-[10%]">
          <p className="m-0 text-[10px] font-semibold tracking-[-.01em]">
            Image requirement
          </p>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[7px] text-white/65">
            <span>Full body</span>
            <span>Good lighting</span>
            <span>Face camera</span>
            <span>Clear background</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={tryOnHref}
              className="inline-flex min-h-8 items-center justify-center border border-white/25 bg-white/10 px-2 text-[7px] font-bold !text-white transition hover:bg-white/20"
            >
              Live camera
            </Link>
            <Link
              href={tryOnHref}
              className="inline-flex min-h-8 items-center justify-center bg-white px-2 text-[7px] font-bold !text-[#111]"
            >
              Take photo
            </Link>
          </div>
        </aside>

        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 sm:bottom-5">
          <Link
            href={tryOnHref}
            className="inline-flex min-h-9 items-center justify-center bg-[#b7ff35] px-5 text-[9px] font-bold text-[#111] shadow-[0_8px_22px_rgba(0,0,0,.12)] transition hover:scale-[1.02]"
          >
            Try with AI
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[76px] z-40 h-[108px] sm:bottom-[82px] sm:h-[116px] lg:bottom-[86px] lg:h-[124px]">
        <div
          ref={railRef}
          onPointerDown={(event) => {
            event.stopPropagation();
            railInteractingRef.current = true;
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
            railInteractingRef.current = false;
          }}
          onPointerCancel={() => {
            railInteractingRef.current = false;
          }}
          onPointerLeave={() => {
            railInteractingRef.current = false;
          }}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchEnd={(event) => event.stopPropagation()}
          onScroll={() => {
            const rail = railRef.current;
            if (!rail) return;

            const width = rail.scrollWidth / 3;
            if (!width) return;

            if (rail.scrollLeft < width * 0.35) {
              rail.scrollLeft += width;
            } else if (rail.scrollLeft > width * 2.65) {
              rail.scrollLeft -= width;
            }
          }}
          className="flex h-full w-full cursor-grab items-center gap-3 overflow-x-auto px-4 [scrollbar-width:none] active:cursor-grabbing sm:gap-4 sm:px-6 lg:gap-5 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {[0, 1, 2].flatMap((setIndex) =>
            railProducts.map((product, index) => {
              const selected = product.baseIndex === activeIndex;
              const shapeIndex = index % 5;

              const shapeClass =
                shapeIndex === 0
                  ? "h-[88px] w-[70px] sm:h-[96px] sm:w-[76px] lg:h-[104px] lg:w-[82px]"
                  : shapeIndex === 1
                    ? "h-[82px] w-[82px] sm:h-[90px] sm:w-[90px] lg:h-[96px] lg:w-[96px]"
                    : shapeIndex === 2
                      ? "h-[78px] w-[104px] sm:h-[86px] sm:w-[114px] lg:h-[92px] lg:w-[124px]"
                      : shapeIndex === 3
                        ? "h-[96px] w-[76px] sm:h-[104px] sm:w-[82px] lg:h-[112px] lg:w-[88px]"
                        : "h-[80px] w-[94px] sm:h-[88px] sm:w-[104px] lg:h-[94px] lg:w-[112px]";

              return (
                <button
                  key={setIndex + "-" + product.railId}
                  type="button"
                  aria-label={"Select " + product.name}
                  aria-current={selected ? "true" : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectProduct(product.baseIndex, true);
                  }}
                  className={
                    "relative shrink-0 overflow-hidden border border-white/55 bg-white/55 shadow-[0_8px_24px_rgba(0,0,0,.10)] backdrop-blur-md transition-[transform,border-color,background-color,opacity] duration-300 " +
                    shapeClass +
                    " " +
                    (selected
                      ? "scale-[1.08] border-2 border-[#b7ff35] bg-white/82 opacity-100 shadow-[0_12px_30px_rgba(0,0,0,.17)]"
                      : "opacity-84 hover:scale-[1.03] hover:bg-white/74 hover:opacity-100")
                  }
                >
                  <img
                    src={product.image}
                    alt=""
                    draggable={false}
                    className="absolute inset-[4%] h-[92%] w-[92%] select-none object-contain object-center"
                  />
                </button>
              );
            }),
          )}
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
