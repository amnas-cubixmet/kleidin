"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Offer } from "@/types/commerce";
import type { Product } from "@/types/product";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(endAt?: string | null): TimeLeft {
  if (!endAt) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const remaining = Math.max(0, new Date(endAt).getTime() - Date.now());
  const total = Math.floor(remaining / 1000);

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function TopFashionHero({
  products,
  contactHref,
  offer,
}: {
  products: Product[];
  contactHref: string;
  offer?: Offer | null;
}) {
  const product = useMemo(
    () => products.find((item) => item.image) ?? products[0],
    [products],
  );

  const slideCount = offer ? 2 : 1;
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(offer?.endsAt),
  );

  useEffect(() => {
    if (slideCount <= 1) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    let timer = 0;

    const start = () => {
      window.clearInterval(timer);
      if (document.hidden) return;

      timer = window.setInterval(() => {
        setIndex((current) => (current + 1) % slideCount);
      }, 5200);
    };

    start();
    document.addEventListener("visibilitychange", start);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, [slideCount]);

  useEffect(() => {
    if (!offer?.endsAt) return;

    const update = () => setTimeLeft(getTimeLeft(offer.endsAt));
    update();

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [offer?.endsAt]);

  if (!product) return null;

  const timerItems = [
    ["Days", pad(timeLeft.days)],
    ["Hours", pad(timeLeft.hours)],
    ["Minutes", pad(timeLeft.minutes)],
    ["Seconds", pad(timeLeft.seconds)],
  ];

  const isOffer = index === 1 && Boolean(offer);

  return (
    <section className="mx-auto mb-0 w-full px-0 sm:mb-3 sm:w-[min(calc(100%-24px),1440px)]">
      <div className="relative h-[64svh] min-h-[520px] max-h-[680px] overflow-hidden rounded-none bg-[#071225] text-white sm:rounded-[20px] md:h-auto md:min-h-[78svh] md:max-h-none md:rounded-[26px]">
        <div className="absolute inset-0">
          <div
            className={`top-fashion-slide absolute inset-0 transition-opacity duration-500 ease-out ${
              !isOffer ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={isOffer}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="100vw"
                className="object-cover object-[62%_center] md:object-center"
              />
            ) : null}
          </div>

          {offer?.imageUrl ? (
            <div
              className={`top-fashion-slide absolute inset-0 transition-opacity duration-500 ease-out ${
                isOffer ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!isOffer}
            >
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ) : null}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,24,.90)_0%,rgba(3,10,24,.72)_43%,rgba(3,10,24,.22)_72%,rgba(3,10,24,.04)_100%)] md:bg-[linear-gradient(90deg,rgba(3,10,24,.96)_0%,rgba(3,10,24,.84)_38%,rgba(3,10,24,.22)_69%,rgba(3,10,24,.03)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,24,.05)_25%,rgba(3,10,24,.10)_52%,rgba(3,10,24,.72)_100%)] md:hidden" />

        <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-between px-5 py-5 md:min-h-[78svh] md:px-12 md:py-10 lg:px-16 lg:py-12">
          <div className="flex items-center justify-end">
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[8px] font-medium text-white/75 backdrop-blur-sm">
              {isOffer ? offer?.badge : product.category}
            </span>
          </div>

          {!isOffer ? (
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
                  <span>{product.name}</span>
                  <span>•</span>
                  <span>₹{product.price.toLocaleString("en-IN")}</span>
                </div>

                <div className="mt-4 flex w-full flex-wrap items-center justify-start gap-2.5 md:mt-5 md:w-auto">
                  <Link
                    href="/products"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-[9px] font-semibold !text-[#111111] transition hover:bg-[#eef2ff] md:text-[10px]"
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
          ) : (
            <div className="max-w-[760px] pb-1 md:pb-4">
              <p className="mb-2.5 text-[8px] font-semibold tracking-[0.16em] text-[#7395ff] md:mb-4 md:text-[10px]">
                LIMITED TIME OFFER
              </p>

              <h2 className="m-0 max-w-[820px] text-[clamp(52px,14vw,74px)] font-semibold leading-[0.82] tracking-[-0.065em] md:text-[clamp(88px,8.5vw,138px)]">
                FLAT {offer?.discountText}
                <br />
                OFF
              </h2>

              {offer?.endsAt ? (
                <div className="mt-5 grid max-w-[420px] grid-cols-4 gap-2 md:mt-7">
                  {timerItems.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[10px] border border-white/15 bg-white/5 px-2 py-3 backdrop-blur-sm"
                    >
                      <strong className="block text-[17px] font-semibold md:text-[22px]">
                        {value}
                      </strong>
                      <span className="mt-1 block text-[6px] uppercase tracking-[0.08em] text-white/45">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <Link
                href={offer?.ctaHref ?? "/products"}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-[9px] font-semibold !text-[#111111] transition hover:bg-[#eef2ff] md:mt-7 md:text-[10px]"
                style={{ color: "#111111" }}
              >
                {offer?.ctaLabel ?? "Shop offer"}
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <span className="text-[8px] font-semibold text-white/70">
                {String(index + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
              </span>

              <div className="flex gap-1">
                {Array.from({ length: slideCount }).map((_, slideIndex) => (
                  <button
                    key={slideIndex}
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
