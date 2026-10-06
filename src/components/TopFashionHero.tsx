"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type {
  HeroCtaStyle,
  HeroImagePosition,
  HeroSlideConfig,
} from "@/data/hero-slides";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type ResolvedHeroSlide = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  button: string;
  href: string;
  image?: string;
  badge?: string;
  meta?: string;
  discountText?: string;
  showCountdown?: boolean;
  endsAt?: string | null;
  ctaStyle: HeroCtaStyle;
  imagePosition: HeroImagePosition;
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

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function isScheduledNow(slide: HeroSlideConfig, now: number) {
  const starts = slide.startsAt ? new Date(slide.startsAt).getTime() : null;
  const ends = slide.endsAt ? new Date(slide.endsAt).getTime() : null;

  if (starts !== null && Number.isFinite(starts) && now < starts) return false;
  if (ends !== null && Number.isFinite(ends) && now > ends) return false;
  return true;
}

export function TopFashionHero({
  products,
  heroSlides,
}: {
  products: Product[];
  heroSlides: HeroSlideConfig[];
}) {
  const [index, setIndex] = useState(0);
  const [scheduleNow, setScheduleNow] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const slides = useMemo<ResolvedHeroSlide[]>(() => {
    return [...heroSlides]
      .filter(
        (slide) =>
          slide.enabled &&
          (!scheduleNow || isScheduledNow(slide, scheduleNow)),
      )
      .sort((a, b) => a.order - b.order)
      .map<ResolvedHeroSlide | null>((slide) => {
        const selectedProduct = slide.productId
          ? products.find(
              (product) =>
                product.id === slide.productId && product.status === "active",
            )
          : undefined;

        const product = selectedProduct;

        // Product hero slides must always point to the exact real product
        // selected in Admin. Never substitute another product when the
        // selected product was deleted, drafted, or is otherwise unavailable.
        if (slide.kind === "product" && !product) return null;

        const variantImage =
          product?.colorVariants?.find((variant) => variant.images?.length)
            ?.images?.[0] ??
          product?.colorVariants?.find((variant) => variant.image)?.image;

        const image = slide.imageUrl || product?.image || variantImage;
        const title = slide.title || product?.name || "";

        if (!title) return null;

        return {
          id: slide.id,
          label: slide.label || product?.category || "KLEID.IN",
          title,
          subtitle: slide.subtitle || product?.description || "",
          button: slide.button || (product ? "View product" : "Explore"),
          href:
            slide.href ||
            (product ? `/products/${product.slug}` : "/products"),
          image,
          badge:
            slide.badge ||
            slide.discountText ||
            slide.label ||
            product?.category ||
            "KLEID.IN",
          meta: product
            ? `${product.name} · ${money(product.price)}`
            : undefined,
          discountText: slide.discountText,
          showCountdown: Boolean(slide.showCountdown && slide.endsAt),
          endsAt: slide.endsAt,
          ctaStyle: slide.ctaStyle ?? "light",
          imagePosition: slide.imagePosition ?? "center",
        } satisfies ResolvedHeroSlide;
      })
      .filter((slide): slide is ResolvedHeroSlide => slide !== null);
  }, [heroSlides, products, scheduleNow]);

  const slideCount = slides.length;
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    const syncSchedule = () => setScheduleNow(Date.now());
    syncSchedule();

    const timer = window.setInterval(syncSchedule, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!current?.showCountdown || !current.endsAt) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const update = () => setTimeLeft(getTimeLeft(current.endsAt));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [current?.endsAt, current?.showCountdown]);

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
        setIndex((currentIndex) => (currentIndex + 1) % slideCount);
      }, 5600);
    };

    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, [slideCount]);

  useEffect(() => {
    if (index >= slideCount) setIndex(0);
  }, [index, slideCount]);

  if (!current) return null;

  const isExternal =
    current.href.startsWith("http://") ||
    current.href.startsWith("https://") ||
    current.href.startsWith("mailto:");

  const titleIsLong = current.title.length > 20;

  const ctaClass =
    "inline-flex min-h-[44px] items-center justify-center rounded-none px-5 text-[10px] font-bold uppercase tracking-[.08em] transition " +
    (current.ctaStyle === "dark"
      ? "bg-[#111111] !text-white hover:bg-black"
      : current.ctaStyle === "outline"
        ? "border border-black/25 bg-transparent !text-[#111111] hover:bg-black/[.04]"
        : "border border-black/10 bg-white !text-[#111111] hover:bg-[#f7f7f7]");

  return (
    <section className="mx-auto w-full px-0 sm:w-[min(calc(100%-24px),1440px)]">
      <div className="relative min-h-[620px] overflow-hidden bg-[#e9e7e2] text-[#111111] sm:rounded-[18px] md:aspect-[16/9] md:min-h-0 md:rounded-[22px]">
        <div className="absolute inset-0">
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
                slideIndex === index
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-[1.015] opacity-0"
              }`}
              aria-hidden={slideIndex !== index}
            >
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slideIndex === 0}
                  sizes="(max-width: 767px) 100vw, (max-width: 1440px) 100vw, 1440px"
                  quality={90}
                  className={`object-cover ${
                    slide.imagePosition === "left"
                      ? "object-[30%_center] md:object-left"
                      : slide.imagePosition === "right"
                        ? "object-[70%_center] md:object-right"
                        : "object-center"
                  }`}
                />
              ) : (
                <div className="absolute inset-0 bg-[#e9e7e2]" />
              )}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(239,237,232,.98)_0%,rgba(239,237,232,.94)_31%,rgba(239,237,232,.72)_48%,rgba(239,237,232,.18)_68%,rgba(239,237,232,0)_86%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(239,237,232,.08)_0%,rgba(239,237,232,.08)_58%,rgba(239,237,232,.62)_100%)] md:hidden" />

        <div className="relative z-10 flex min-h-[620px] flex-col px-5 py-5 md:min-h-0 md:h-full md:px-12 md:py-9 lg:px-16 lg:py-12">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[8px] font-bold uppercase tracking-[.14em] text-black/45 md:text-[9px]">
              {current.label}
            </span>

            <span className="max-w-[58vw] truncate border border-black/10 bg-white/65 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[.08em] text-black/55 backdrop-blur-sm">
              {current.badge ?? current.label}
            </span>
          </div>

          <div className="flex flex-1 items-center">
            <div className="max-w-[560px] py-10 md:max-w-[620px] md:py-0">
              {current.discountText ? (
                <strong className="mb-3 block text-[10px] font-bold uppercase tracking-[.12em] text-[#001cac] md:text-[11px]">
                  {current.discountText}
                </strong>
              ) : null}

              <h1
                className={`m-0 max-w-[650px] uppercase font-black leading-[0.86] tracking-[-0.06em] ${
                  titleIsLong
                    ? "text-[clamp(42px,12vw,66px)] md:text-[clamp(58px,5.8vw,96px)]"
                    : "text-[clamp(50px,14vw,78px)] md:text-[clamp(68px,6.7vw,112px)]"
                }`}
              >
                {current.title}
              </h1>

              {current.subtitle ? (
                <p className="mt-5 max-w-[390px] text-[10px] leading-[1.65] text-black/58 md:max-w-[430px] md:text-[11px] md:leading-[1.7]">
                  {current.subtitle}
                </p>
              ) : null}

              {current.meta ? (
                <p className="mt-3 text-[8px] font-semibold uppercase tracking-[.06em] text-black/38 md:text-[9px]">
                  {current.meta}
                </p>
              ) : null}

              {current.showCountdown ? (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {[
                    ["Days", timeLeft.days],
                    ["Hrs", timeLeft.hours],
                    ["Min", timeLeft.minutes],
                    ["Sec", timeLeft.seconds],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="min-w-[58px] border border-black/10 bg-white/60 px-3 py-2.5 backdrop-blur-sm"
                    >
                      <strong className="block text-[17px] font-bold md:text-[20px]">
                        {pad(Number(value))}
                      </strong>
                      <span className="text-[6px] uppercase tracking-[0.1em] text-black/35">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {isExternal ? (
                  <a
                    href={current.href}
                    target={
                      current.href.startsWith("https://")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      current.href.startsWith("https://")
                        ? "noreferrer"
                        : undefined
                    }
                    className={ctaClass}
                  >
                    {current.button}
                  </a>
                ) : (
                  <Link href={current.href} className={ctaClass}>
                    {current.button}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 text-[8px] font-bold text-black/50">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(slideCount).padStart(2, "0")}
              </span>

              <div className="flex max-w-[220px] items-center gap-1 overflow-hidden md:max-w-none">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Show ${slide.label || slide.title} slide`}
                    onClick={() => setIndex(slideIndex)}
                    className={`h-[3px] shrink-0 transition-all duration-300 ${
                      slideIndex === index
                        ? "w-8 bg-black md:w-10"
                        : "w-3 bg-black/20 hover:bg-black/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            <span className="hidden text-[8px] font-bold uppercase tracking-[.12em] text-black/30 sm:block">
              16:9 editorial hero
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
