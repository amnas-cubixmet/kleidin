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
  title: string;
  subtitle: string;
  button: string;
  href: string;
  image?: string;
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
          title,
          subtitle: slide.subtitle || product?.description || "",
          button: slide.button || (product ? "View product" : "Explore"),
          href:
            slide.href ||
            (product ? `/products/${product.slug}` : "/products"),
          image,
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
      <div className="relative overflow-hidden bg-[#efede8] text-[#111111] sm:rounded-[18px] md:aspect-[16/9] md:rounded-[22px]">
        <div className="relative h-[54svh] min-h-[350px] overflow-hidden bg-[#dedbd5] md:absolute md:inset-y-0 md:right-0 md:h-auto md:min-h-0 md:w-[57%]">
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
                  sizes="(max-width: 767px) 100vw, 57vw"
                  quality={90}
                  className={`object-cover ${
                    slide.imagePosition === "left"
                      ? "object-left"
                      : slide.imagePosition === "right"
                        ? "object-right"
                        : "object-center"
                  }`}
                />
              ) : (
                <div className="absolute inset-0 bg-[#dedbd5]" />
              )}
            </div>
          ))}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-[#efede8] via-[#efede8]/35 to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[14%] bg-gradient-to-r from-[#efede8] to-transparent md:block" />
        </div>

        <div className="relative z-10 flex flex-col px-5 pb-6 pt-5 md:h-full md:w-[52%] md:px-12 md:py-9 lg:px-16 lg:py-12">
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-[560px] py-8 md:max-w-[560px] md:py-0">
              {current.discountText ? (
                <strong className="mb-3 block text-[10px] font-bold uppercase tracking-[.12em] text-[#001cac] md:text-[11px]">
                  {current.discountText}
                </strong>
              ) : null}

              <h1
                className={`m-0 max-w-[560px] whitespace-pre-line uppercase font-black leading-[0.88] tracking-[-0.06em] ${
                  titleIsLong
                    ? "text-[clamp(40px,11vw,62px)] md:text-[clamp(52px,5.1vw,82px)]"
                    : "text-[clamp(48px,13vw,72px)] md:text-[clamp(60px,5.8vw,94px)]"
                }`}
              >
                {current.title}
              </h1>

              {current.subtitle ? (
                <p className="mt-5 max-w-[360px] text-[10px] leading-[1.65] text-black/58 md:max-w-[390px] md:text-[11px] md:leading-[1.7]">
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
                      className="min-w-[58px] border border-black/10 bg-white/65 px-3 py-2.5 backdrop-blur-sm"
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
                    aria-label={`Show ${slide.title} slide`}
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
              Daily essentials
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
