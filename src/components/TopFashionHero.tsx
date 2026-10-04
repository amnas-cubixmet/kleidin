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
  const [now, setNow] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const slides = useMemo<ResolvedHeroSlide[]>(() => {
    const fallbackSlide: ResolvedHeroSlide = {
      id: "kleidin-default-hero",
      label: "KLEID.IN / ESSENTIALS",
      title: "ESSENTIALS WITHOUT NOISE.",
      subtitle:
        "Clean everyday pieces, considered proportions and a wardrobe built to be repeated.",
      button: "Shop collection",
      href: "/products",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=88",
      badge: "KLEID.IN",
      ctaStyle: "light",
      imagePosition: "center",
    };

    if (!products.length) {
      return heroSlides.length
        ? heroSlides
            .filter((slide) => slide.enabled && (!now || isScheduledNow(slide, now)))
            .sort((a, b) => a.order - b.order)
            .map((slide) => ({
              id: slide.id,
              label: slide.label || "KLEID.IN",
              title: slide.title || fallbackSlide.title,
              subtitle: slide.subtitle || fallbackSlide.subtitle,
              button: slide.button || "Explore",
              href: slide.href || "/products",
              image: slide.imageUrl || fallbackSlide.image,
              badge: slide.badge || slide.label || "KLEID.IN",
              discountText: slide.discountText,
              showCountdown: Boolean(slide.showCountdown && slide.endsAt),
              endsAt: slide.endsAt,
              ctaStyle: slide.ctaStyle ?? "light",
              imagePosition: slide.imagePosition ?? "center",
            }))
        : [fallbackSlide];
    }

    const featured =
      products.find((product) => product.featured && product.stock > 0) ??
      products.find((product) => product.stock > 0) ??
      products[0];

    const resolved = [...heroSlides]
      .filter((slide) => slide.enabled && (!now || isScheduledNow(slide, now)))
      .sort((a, b) => a.order - b.order)
      .map((slide) => {
        const selectedProduct = slide.productId
          ? products.find((product) => product.id === slide.productId)
          : undefined;

        const product =
          selectedProduct ??
          (slide.kind === "product" ? featured : undefined);

        const image =
          slide.imageUrl ||
          product?.image ||
          product?.colorVariants?.[0]?.images?.[0] ||
          featured.image;

        const href =
          slide.href ||
          (product ? `/products/${product.slug}` : "/products");

        const meta = product
          ? `${product.name} · ${money(product.price)}`
          : undefined;

        return {
          id: slide.id,
          label: slide.label,
          title: slide.title || product?.name || "KLEID.IN",
          subtitle:
            slide.subtitle ||
            product?.description ||
            "Everyday clothing without unnecessary noise.",
          button: slide.button || (product ? "View product" : "Shop now"),
          href,
          image,
          badge: slide.badge || slide.discountText || slide.label,
          meta,
          discountText: slide.discountText,
          showCountdown: Boolean(slide.showCountdown && slide.endsAt),
          endsAt: slide.endsAt,
          ctaStyle: slide.ctaStyle ?? "light",
          imagePosition: slide.imagePosition ?? "center",
        };
      });

    if (resolved.length) return resolved;

    return [
      {
        ...fallbackSlide,
        image:
          featured.image ||
          featured.colorVariants?.[0]?.images?.[0] ||
          featured.colorVariants?.[0]?.image ||
          fallbackSlide.image,
        meta: `${featured.name} · ${money(featured.price)}`,
      },
    ];
  }, [heroSlides, now, products]);

  const slideCount = slides.length;
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
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

  const imagePositionClass =
    current.imagePosition === "left"
      ? "object-left"
      : current.imagePosition === "right"
        ? "object-right"
        : "object-center";

  const ctaClass =
    "inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-[10px] font-bold transition " +
    (current.ctaStyle === "dark"
      ? "bg-[#111111] !text-white hover:bg-black"
      : current.ctaStyle === "outline"
        ? "border border-white/70 bg-transparent !text-white hover:bg-white/10"
        : "bg-white !text-[#111111] hover:bg-[#f1f1f1]");

  return (
    <section className="mx-auto mb-0 w-full px-0 sm:mb-3 sm:w-[min(calc(100%-24px),1440px)]">
      <div className="relative h-[60svh] min-h-[500px] max-h-[620px] overflow-hidden rounded-none bg-[#071225] text-white sm:rounded-[20px] md:h-[68svh] md:min-h-[560px] md:max-h-[720px] md:rounded-[26px]">
        <div className="absolute inset-0">
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
                slideIndex === index
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-[1.02] opacity-0"
              }`}
              aria-hidden={slideIndex !== index}
            >
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  className={`object-cover ${slide.imagePosition === "left" ? "object-left" : slide.imagePosition === "right" ? "object-right" : "object-center"}`}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,24,.94)_0%,rgba(3,10,24,.74)_43%,rgba(3,10,24,.20)_72%,rgba(3,10,24,.04)_100%)] md:bg-[linear-gradient(90deg,rgba(3,10,24,.96)_0%,rgba(3,10,24,.84)_38%,rgba(3,10,24,.22)_69%,rgba(3,10,24,.03)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,24,.04)_22%,rgba(3,10,24,.10)_50%,rgba(3,10,24,.76)_100%)] md:hidden" />

        <div className="relative z-10 flex h-full flex-col justify-between px-5 py-5 md:px-12 md:py-9 lg:px-16 lg:py-10">
          <div className="flex items-center justify-end">
            <span className="max-w-[62vw] truncate rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[8px] font-medium text-white/75 backdrop-blur-sm">
              {current.badge ?? current.label}
            </span>
          </div>

          <div className="max-w-[860px] pb-1 md:pb-4">
            <p className="mb-2.5 text-[8px] font-semibold tracking-[0.16em] text-white/65 md:mb-4 md:text-[10px]">
              {current.label}
            </p>

            {current.discountText ? (
              <strong className="mb-3 block text-[13px] font-bold tracking-[.04em] text-white md:text-[15px]">
                {current.discountText}
              </strong>
            ) : null}

            <h1
              className={`m-0 max-w-[900px] font-semibold leading-[0.84] tracking-[-0.065em] ${
                titleIsLong
                  ? "text-[clamp(40px,10.5vw,56px)] md:text-[clamp(68px,6.4vw,106px)]"
                  : "text-[clamp(48px,12.5vw,66px)] md:text-[clamp(82px,8vw,132px)]"
              }`}
            >
              {current.title}
            </h1>

            <p className="mt-4 max-w-[430px] text-[10px] leading-5 text-white/70 md:mt-5 md:max-w-[500px] md:text-[12px] md:leading-6">
              {current.subtitle}
            </p>

            {current.meta ? (
              <p className="mt-3 text-[8px] font-medium tracking-[0.03em] text-white/52 md:text-[9px]">
                {current.meta}
              </p>
            ) : null}

            {current.showCountdown ? (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-white md:mt-6">
                {[
                  ["Days", timeLeft.days],
                  ["Hrs", timeLeft.hours],
                  ["Min", timeLeft.minutes],
                  ["Sec", timeLeft.seconds],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="min-w-[64px] rounded-[10px] border border-white/15 bg-white/5 px-3 py-2.5 backdrop-blur-sm"
                  >
                    <strong className="block text-[18px] font-semibold md:text-[22px]">
                      {pad(Number(value))}
                    </strong>
                    <span className="text-[6px] uppercase tracking-[0.1em] text-white/45">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2.5 md:mt-6">
              {isExternal ? (
                <a
                  href={current.href}
                  target={current.href.startsWith("https://") ? "_blank" : undefined}
                  rel={current.href.startsWith("https://") ? "noreferrer" : undefined}
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

          <div className="flex items-center pt-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 text-[8px] font-semibold text-white/70">
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
                    className={`h-[3px] shrink-0 rounded-full transition-all duration-300 ${
                      slideIndex === index
                        ? "w-7 bg-white md:w-9"
                        : "w-3 bg-white/25 hover:bg-white/50"
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
