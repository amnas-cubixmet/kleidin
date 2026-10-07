"use client";

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
                className="h-full w-full select-none object-cover object-top"
              />
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 z-[11] bg-black/10" />
        </>
      ) : null}

      <div className="pointer-events-none absolute left-5 top-[18%] z-30 max-w-[520px] text-white sm:left-8 sm:top-[20%] lg:left-12 lg:top-1/2 lg:-translate-y-1/2">
        <p className="m-0 text-[8px] font-semibold uppercase tracking-[.18em] text-white/55 sm:text-[9px]">
          KLEID.IN / DAILY
        </p>

        <h1 className="mt-4 max-w-[460px] text-[clamp(42px,6.2vw,88px)] font-semibold leading-[.86] tracking-[-.065em]">
          ESSENTIALS
          <br />
          WITHOUT NOISE
        </h1>

        <p
          key={"hero-name-" + active.id + "-" + activeIndex}
          className="hero-active-name mt-5 text-[10px] font-medium uppercase tracking-[.12em] text-white/68 sm:text-[11px]"
        >
          {active.name}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-[76px] z-40 flex h-[112px] items-center sm:bottom-[82px] sm:h-[122px] lg:bottom-[86px] lg:h-[132px]">
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
                    "relative h-[86px] w-[21.5vw] shrink-0 overflow-hidden border border-white/30 bg-white/20 shadow-[0_8px_24px_rgba(0,0,0,.08)] backdrop-blur-md transition-[transform,border-color,background-color,opacity] duration-300 sm:h-[96px] sm:w-[15.25vw] lg:h-[104px] lg:w-[11.625vw] xl:h-[110px] " +
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

        .hero-active-name {
          animation: heroActiveNameIn 620ms cubic-bezier(.16,1,.3,1) both;
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

        @keyframes heroActiveNameIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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


      `}</style>
    </section>
  );
}
