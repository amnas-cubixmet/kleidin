"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export function TopFashionHero({
  products,
  contactHref,
}: {
  products: Product[];
  contactHref: string;
}) {
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

    let timer = 0;

    const start = () => {
      window.clearInterval(timer);
      if (document.hidden) return;

      timer = window.setInterval(() => {
        setIndex((current) => (current + 1) % slides.length);
      }, 5200);
    };

    start();
    document.addEventListener("visibilitychange", start);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <section className="mx-auto mb-0 w-full px-0 sm:mb-3 sm:w-[min(calc(100%-24px),1440px)]">
      <div className="relative h-[64svh] min-h-[520px] max-h-[680px] overflow-hidden rounded-none bg-[#071225] text-white sm:rounded-[20px] md:h-auto md:min-h-[78svh] md:max-h-none md:rounded-[26px]">
        <div className="absolute inset-0">
          {slides.map((product, slideIndex) => (
            <div
              key={product.id}
              className={`top-fashion-slide absolute inset-0 transition-opacity duration-500 ease-out ${
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
                  className="object-cover object-[62%_center] md:object-center"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,24,.90)_0%,rgba(3,10,24,.72)_43%,rgba(3,10,24,.22)_72%,rgba(3,10,24,.04)_100%)] md:bg-[linear-gradient(90deg,rgba(3,10,24,.96)_0%,rgba(3,10,24,.84)_38%,rgba(3,10,24,.22)_69%,rgba(3,10,24,.03)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,24,.05)_25%,rgba(3,10,24,.10)_52%,rgba(3,10,24,.72)_100%)] md:hidden" />

        <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-between px-5 py-5 md:min-h-[78svh] md:px-12 md:py-10 lg:px-16 lg:py-12">
          <div className="flex items-center justify-end">
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[8px] font-medium text-white/75 backdrop-blur-sm">
              {current.category}
            </span>
          </div>

          <div className="max-w-[760px] pb-1 md:pb-4">
            <p className="mb-2.5 text-[8px] font-semibold tracking-[0.16em] text-[#7395ff] md:mb-4 md:text-[10px]">
              EVERYDAY ESSENTIALS
            </p>

            <h1 className="m-0 max-w-[820px] text-[clamp(46px,12.5vw,64px)] font-semibold leading-[0.84] tracking-[-0.065em] md:text-[clamp(82px,8vw,132px)] md:leading-[0.82]">
              WEAR IT
              <br />
              YOUR WAY
            </h1>

            <div className="mt-5 max-w-[620px] md:mt-7">
              <div className="flex max-w-[330px] items-center gap-2 overflow-hidden text-[8px] text-white/55 md:max-w-[420px] md:gap-3 md:text-[9px]">
                <span>{current.name}</span>
                <span>•</span>
                <span>₹{current.price.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-4 flex w-full flex-wrap items-center justify-start gap-2.5 md:mt-5 md:w-auto">
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center justify-center gap-4 rounded-full bg-white px-4 text-[9px] font-semibold !text-[#111111] transition hover:bg-[#eef2ff] md:gap-6 md:px-5 md:text-[10px]"
                  style={{ color: "#111111" }}
                >
                  Shop collection
                </Link>

                <a
                  href={contactHref}
                  target={contactHref.startsWith("https://wa.me/") ? "_blank" : undefined}
                  rel={contactHref.startsWith("https://wa.me/") ? "noreferrer" : undefined}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 text-[9px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
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


          </div>
        </div>
      </div>
    </section>
  );
}
