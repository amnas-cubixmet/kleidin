"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export function TopFashionHero({ products }: { products: Product[] }) {
  const slides = useMemo(
    () => products.filter((product) => product.image).slice(0, 3),
    [products],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <section className="mx-auto mb-3 w-[min(calc(100%-16px),1440px)] px-0 sm:w-[min(calc(100%-24px),1440px)]">
      <div className="relative min-h-[68svh] overflow-hidden rounded-[20px] bg-[#071225] text-white md:min-h-[78svh] md:rounded-[26px]">
        <div className="absolute inset-0">
          {slides.map((product, slideIndex) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                slideIndex === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={slideIndex !== index}
            >
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,24,.94)_0%,rgba(3,10,24,.78)_32%,rgba(3,10,24,.24)_64%,rgba(3,10,24,.06)_100%)] md:bg-[linear-gradient(90deg,rgba(3,10,24,.96)_0%,rgba(3,10,24,.84)_38%,rgba(3,10,24,.22)_69%,rgba(3,10,24,.03)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,24,.02)_45%,rgba(3,10,24,.58)_100%)] md:hidden" />

        <div className="relative z-10 flex min-h-[68svh] flex-col justify-between px-5 py-6 md:min-h-[78svh] md:px-12 md:py-10 lg:px-16 lg:py-12">
          <div className="flex items-center justify-between">
            <p className="m-0 text-[8px] font-semibold tracking-[0.18em] text-white/65 md:text-[9px]">
              KLEID.IN / NEW SEASON
            </p>

            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[8px] font-medium text-white/75 backdrop-blur-sm">
              {current.category}
            </span>
          </div>

          <div className="max-w-[760px] pb-2 md:pb-4">
            <p className="mb-3 text-[9px] font-semibold tracking-[0.16em] text-[#7395ff] md:mb-4 md:text-[10px]">
              EVERYDAY ESSENTIALS
            </p>

            <h1 className="m-0 max-w-[820px] text-[clamp(56px,14vw,88px)] font-semibold leading-[0.82] tracking-[-0.07em] md:text-[clamp(82px,8vw,132px)]">
              WEAR IT
              <br />
              YOUR WAY
            </h1>

            <div className="mt-6 flex max-w-[620px] flex-col gap-5 md:mt-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="m-0 max-w-[400px] text-[11px] leading-6 text-white/65 md:text-[12px]">
                  Clean silhouettes, easy layers and pieces designed to work every day.
                </p>

                <div className="mt-4 flex items-center gap-3 text-[9px] text-white/50">
                  <span>{current.name}</span>
                  <span>•</span>
                  <span>₹{current.price.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center gap-6 rounded-full bg-white px-5 text-[10px] font-semibold text-black transition hover:bg-[#eef2ff]"
                >
                  Shop collection <span>→</span>
                </Link>

                <Link
                  href={`/products/${current.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-4 text-[9px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  View piece
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-semibold text-white/70">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>

              <div className="flex gap-1">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Show slide ${slideIndex + 1}`}
                    onClick={() => setIndex(slideIndex)}
                    className={`h-[2px] rounded-full transition-all duration-300 ${
                      slideIndex === index
                        ? "w-8 bg-white"
                        : "w-4 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            <span className="hidden text-[8px] font-medium tracking-[0.12em] text-white/45 sm:block">
              SCROLL TO DISCOVER ↓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
