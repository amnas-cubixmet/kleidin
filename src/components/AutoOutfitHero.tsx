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

type SliderItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  backgroundImage: string;
  modelImage: string;
  category: string;
  price: number;
  demo: boolean;
};

export function AutoOutfitHero({ products }: { products: Product[] }) {
  const items = useMemo<SliderItem[]>(() => {
    const localPairs = [
      {
        foreground: "/images/product-1.png",
        model: "/images/man-1.png",
        background: "/images/bg.png",
      },
      {
        foreground: "/images/product-2.png",
        model: "/images/man-2.png",
        background: "/images/bg.png",
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
        modelImage: pair.model,
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
        modelImage: localPair?.model || "",
        category: product.category,
        price: product.price,
        demo: false,
      };
    });
  }, [products]);

  const railProducts = useMemo(() => {
    const source = items.slice(0, 20);
    if (!source.length) return [];

    const slotCount = Math.max(8, source.length);

    return Array.from({ length: slotCount }, (_, slotIndex) => {
      const baseIndex = slotIndex % source.length;
      const product = source[baseIndex];

      return {
        ...product,
        railId: "rail-" + slotIndex + "-" + product.id,
        baseIndex,
      };
    });
  }, [items]);

  const heroShowcaseCount = Math.min(items.length, 8);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = false;
  const railRef = useRef<HTMLDivElement | null>(null);
  const railInteractingRef = useRef(false);
  const railFrameRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const active = items[activeIndex] ?? items[0];


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
            key={"background-" + active.backgroundImage}
            className="selected-background absolute inset-0"
          >
            <img
              src={active.backgroundImage}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          </div>

          {active.modelImage ? (
            <div
              key={"model-" + active.id + "-" + activeIndex}
              className="selected-product-image pointer-events-none absolute inset-0 z-10"
            >
              <img
                src={active.modelImage}
                alt=""
                draggable={false}
                className="hero-model-image h-full w-full select-none object-contain object-bottom sm:object-cover sm:object-top"
              />
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 z-[11] bg-black/10" />
        </>
      ) : null}

      <div className="pointer-events-none absolute left-4 top-[17%] z-30 w-[46vw] max-w-[430px] text-white sm:left-8 sm:top-[20%] sm:w-auto lg:left-12 lg:top-1/2 lg:-translate-y-1/2">
        <div className="hero-brand-copy">
          <p className="m-0 text-[8px] font-semibold uppercase tracking-[.18em] text-white/55 sm:text-[9px]">
            KLEID.IN / DAILY
          </p>

          <h1 className="mt-2 max-w-[460px] text-[clamp(28px,9vw,36px)] font-semibold leading-[.88] tracking-[-.055em] sm:mt-4 sm:text-[clamp(42px,5.8vw,82px)]">
            ESSENTIALS
            <br />
            WITHOUT NOISE
          </h1>
        </div>
      </div>

      <div className="absolute right-3 top-[42%] z-30 w-[40vw] max-w-[300px] -translate-y-1/2 text-left text-white sm:right-[7vw] sm:top-1/2 sm:w-[min(52vw,340px)] sm:max-w-none lg:right-[9vw] lg:w-[360px]">
        <div
          key={"hero-meta-" + active.id + "-" + activeIndex}
          className="hero-product-meta sm:px-0 sm:py-0"
        >
          <p className="m-0 text-[8px] font-semibold uppercase tracking-[.18em] text-white/52 sm:text-[9px]">
            {active.category}
          </p>

          <h2 className="mt-2 max-w-[260px] text-[clamp(17px,5.4vw,24px)] font-semibold leading-[.95] tracking-[-.04em] sm:mt-3 sm:max-w-[320px] sm:text-[clamp(28px,3.5vw,48px)]">
            {active.name}
          </h2>

          <p className="mt-3 text-[11px] font-semibold tracking-[-.01em] text-white/90 sm:mt-5 sm:text-[14px]">
            ₹{active.price.toLocaleString("en-IN")}
          </p>

          <Link
            href={active.slug ? "/products/" + active.slug : "/#all-products"}
            className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full bg-white px-4 text-[7px] font-semibold uppercase tracking-[.09em] !text-[#111] shadow-[0_8px_20px_rgba(0,0,0,.10)] transition duration-300 hover:scale-[1.02] hover:bg-white/92 sm:mt-7 sm:min-h-11 sm:px-6 sm:text-[9px]"
          >
            View Product
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[14px] z-40 flex h-[84px] items-center sm:bottom-[82px] sm:h-[122px] lg:bottom-[86px] lg:h-[132px]">
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
          className="flex h-full w-full cursor-grab items-center gap-[1.5vw] overflow-x-auto px-[1.5vw] [scrollbar-width:none] active:cursor-grabbing sm:gap-[1.35vw] sm:px-[1.35vw] lg:gap-[1vw] lg:px-[1vw] [&::-webkit-scrollbar]:hidden"
        >
          {[0, 1, 2].flatMap((setIndex) =>
            railProducts.map((product, index) => {
              const selected = product.baseIndex === activeIndex;

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
                    "relative h-[68px] w-[22vw] shrink-0 overflow-hidden border border-white/30 bg-white/20 shadow-[0_8px_24px_rgba(0,0,0,.08)] backdrop-blur-md transition-[transform,border-color,background-color,opacity] duration-300 sm:h-[96px] sm:w-[15.25vw] lg:h-[104px] lg:w-[11.625vw] xl:h-[110px] " +
                    (selected
                      ? "scale-[1.08] border-2 border-[#b7ff35] bg-white/32 opacity-100 shadow-[0_12px_30px_rgba(0,0,0,.14)]"
                      : "opacity-88 hover:scale-[1.03] hover:bg-white/28 hover:opacity-100")
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

        .hero-brand-copy {
          animation: heroBrandCopyIn 820ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity, filter;
        }

        .hero-product-meta {
          animation: heroProductMetaIn 760ms cubic-bezier(.16,1,.3,1) both;
          will-change: transform, opacity, filter;
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

        @keyframes heroBrandCopyIn {
          from {
            opacity: 0;
            filter: blur(3px);
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateX(0);
          }
        }

        @keyframes heroProductMetaIn {
          from {
            opacity: 0;
            filter: blur(3px);
            transform: translateX(18px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateX(0);
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

        @media (max-width: 767px) {
          .hero-model-image {
            transform: scale(1.16);
            transform-origin: center bottom;
          }

          .hero-product-meta {
            text-shadow: 0 1px 16px rgba(0, 0, 0, .28);
          }


          .hero-brand-copy {
            animation-duration: 680ms;
          }

          .hero-product-meta {
            animation-duration: 680ms;
          }

          @keyframes heroBrandCopyIn {
            from {
              opacity: 0;
              filter: blur(2px);
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              filter: blur(0);
              transform: translateX(0);
            }
          }

          @keyframes heroProductMetaIn {
            from {
              opacity: 0;
              filter: blur(2px);
              transform: translateX(10px);
            }
            to {
              opacity: 1;
              filter: blur(0);
              transform: translateX(0);
            }
          }

          @keyframes selectedImageIn {
            0% {
              opacity: 0;
              transform: translateY(12px) scale(.96);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
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


      `}</style>
    </section>
  );
}
