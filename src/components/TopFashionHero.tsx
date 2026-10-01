"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Offer } from "@/types/commerce";
import type { Product } from "@/types/product";
import {
  defaultHeroSlides,
  HERO_SLIDE_STORAGE_KEY,
  type HeroSlideConfig,
} from "@/data/hero-slides";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type HeroSlide = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  button: string;
  href: string;
  image?: string;
  badge?: string;
  meta?: string;
  showCountdown?: boolean;
  brandOnly?: boolean;
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

export function TopFashionHero({
  products,
  contactHref,
  offer,
}: {
  products: Product[];
  contactHref: string;
  offer?: Offer | null;
}) {
  const [index, setIndex] = useState(0);
  const [heroConfig, setHeroConfig] = useState<HeroSlideConfig[]>(defaultHeroSlides);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!offer?.endsAt) return;
    const update = () => setTimeLeft(getTimeLeft(offer.endsAt));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [offer?.endsAt]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HERO_SLIDE_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as HeroSlideConfig[];
      if (!Array.isArray(parsed)) return;

      const savedById = new Map(parsed.map((item) => [item.id, item]));
      setHeroConfig(
        defaultHeroSlides.map((item) => ({
          ...item,
          ...(savedById.get(item.id) ?? {}),
        })),
      );
    } catch {
      setHeroConfig(defaultHeroSlides);
    }
  }, []);

  const slides = useMemo<HeroSlide[]>(() => {
    if (!products.length) return [];

    const withImage = products.filter((item) => item.image);
    const pick = (position: number) =>
      withImage[position % Math.max(1, withImage.length)] ?? products[0];

    const bestSeller =
      products.find((item) => item.featured && item.stock > 0) ?? products[0];

    const tee =
      products.find((item) => item.category === "T-Shirts") ?? products[0];

    const lowStock =
      [...products]
        .filter((item) => item.stock > 0)
        .sort((a, b) => a.stock - b.stock)[0] ?? products[0];

    const styleProduct = pick(2);
    const colorProduct = pick(1);
    const backProduct = pick(3);
    const tryOnProduct = pick(0);

    const dynamic = new Map<string, Partial<HeroSlide>>([
      ["new-drop", { image: pick(0).image }],
      ["best-seller", {
        image: bestSeller.image,
        href: `/products/${bestSeller.slug}`,
        meta: `${bestSeller.name} · ${money(bestSeller.price)}`,
      }],
      ["category-focus", { image: tee.image }],
      ["limited-stock", {
        image: lowStock.image,
        href: `/products/${lowStock.slug}`,
        badge: `ONLY ${lowStock.stock} LEFT`,
        meta: `${lowStock.name} · ${money(lowStock.price)}`,
      }],
      ["free-shipping", { image: pick(4).image }],
      ["bundle", { image: pick(1).image }],
      ["style-edit", {
        image: styleProduct.image,
        href: `/products/${styleProduct.slug}`,
      }],
      ["color-drop", { image: colorProduct.image }],
      ["back-in-stock", {
        image: backProduct.image,
        href: `/products/${backProduct.slug}`,
      }],
      ["seasonal", {
        label: offer?.badge ?? "SEASONAL EDIT",
        image: offer?.imageUrl ?? pick(2).image,
        href: offer?.ctaHref ?? "/products",
        badge: offer?.discountText ? `${offer.discountText} OFF` : "SEASONAL",
      }],
      ["brand-message", { image: pick(5).image, brandOnly: true }],
      ["journal", { image: tee.image }],
      ["countdown-launch", {
        image: offer?.imageUrl ?? pick(0).image,
        showCountdown: true,
      }],
      ["whatsapp-order", {
        image: pick(4).image,
        href: contactHref,
        button: contactHref.startsWith("https://wa.me/")
          ? "Chat on WhatsApp"
          : "Contact KLEID.IN",
      }],
      ["try-on-anywhere", {
        image: tryOnProduct.image,
        href: `/products/${tryOnProduct.slug}`,
      }],
    ]);

    return [...heroConfig]
      .filter((config) => config.enabled)
      .sort((a, b) => a.order - b.order)
      .map((config) => {
        const auto = dynamic.get(config.id) ?? {};

        return {
          id: config.id,
          label: config.label || auto.label || "",
          title: config.title,
          subtitle: config.subtitle,
          button: config.button || auto.button || "Explore",
          href: config.href || auto.href || "/products",
          image: config.imageUrl || auto.image,
          badge: config.badge || auto.badge,
          meta: auto.meta,
          showCountdown: auto.showCountdown,
          brandOnly: auto.brandOnly,
        };
      });
  }, [contactHref, heroConfig, offer, products]);

  const slideCount = slides.length;
  const current = slides[index] ?? slides[0];

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
    if (!offer?.endsAt) return;

    const update = () => setTimeLeft(getTimeLeft(offer.endsAt));
    update();

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [offer?.endsAt]);

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
    "inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-[9px] font-semibold !text-[#111111] transition hover:bg-[#eef2ff] md:text-[10px]";

  return (
    <section className="mx-auto mb-0 w-full px-0 sm:mb-3 sm:w-[min(calc(100%-24px),1440px)]">
      <div className="relative h-[60svh] min-h-[500px] max-h-[620px] overflow-hidden rounded-none bg-[#071225] text-white sm:rounded-[20px] md:h-[68svh] md:min-h-[560px] md:max-h-[720px] md:rounded-[26px]">
        <div className="absolute inset-0">
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={`top-fashion-slide absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
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
                  className="object-cover object-[62%_center] md:object-center"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            current.brandOnly
              ? "bg-[linear-gradient(90deg,rgba(0,28,172,.94)_0%,rgba(0,28,172,.82)_45%,rgba(0,28,172,.22)_100%)]"
              : "bg-[linear-gradient(90deg,rgba(3,10,24,.91)_0%,rgba(3,10,24,.72)_43%,rgba(3,10,24,.22)_72%,rgba(3,10,24,.04)_100%)] md:bg-[linear-gradient(90deg,rgba(3,10,24,.96)_0%,rgba(3,10,24,.84)_38%,rgba(3,10,24,.22)_69%,rgba(3,10,24,.03)_100%)]"
          }`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,24,.04)_22%,rgba(3,10,24,.10)_50%,rgba(3,10,24,.76)_100%)] md:hidden" />

        <div className="relative z-10 flex h-full flex-col justify-between px-5 py-5 md:px-12 md:py-9 lg:px-16 lg:py-10">
          <div className="flex items-center justify-end">
            <span className="max-w-[62vw] truncate rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[8px] font-medium text-white/75 backdrop-blur-sm">
              {current.badge ?? current.label}
            </span>
          </div>

          <div className="top-fashion-copy max-w-[860px] pb-1 md:pb-4">
            <p className="mb-2.5 text-[8px] font-semibold tracking-[0.16em] text-[#7395ff] md:mb-4 md:text-[10px]">
              {current.label}
            </p>

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
                {offer?.endsAt ? (
                  <>
                    <div className="min-w-[68px] rounded-[10px] border border-white/15 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                      <strong className="block text-[18px] font-semibold md:text-[22px]">
                        {pad(timeLeft.days)}
                      </strong>
                      <span className="text-[6px] uppercase tracking-[0.1em] text-white/45">
                        Days
                      </span>
                    </div>
                    <div className="min-w-[68px] rounded-[10px] border border-white/15 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                      <strong className="block text-[18px] font-semibold md:text-[22px]">
                        {pad(timeLeft.hours)}
                      </strong>
                      <span className="text-[6px] uppercase tracking-[0.1em] text-white/45">
                        Hrs
                      </span>
                    </div>
                    <div className="min-w-[68px] rounded-[10px] border border-white/15 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                      <strong className="block text-[18px] font-semibold md:text-[22px]">
                        {pad(timeLeft.minutes)}
                      </strong>
                      <span className="text-[6px] uppercase tracking-[0.1em] text-white/45">
                        Min
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-[9px] font-semibold tracking-[0.12em] text-white/65">
                    COMING SOON
                  </span>
                )}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2.5 md:mt-6">
              {isExternal ? (
                <a
                  href={current.href}
                  target={current.href.startsWith("https://") ? "_blank" : undefined}
                  rel={current.href.startsWith("https://") ? "noreferrer" : undefined}
                  className={ctaClass}
                  style={{ color: "#111111" }}
                >
                  {current.button}
                </a>
              ) : (
                <Link
                  href={current.href}
                  className={ctaClass}
                  style={{ color: "#111111" }}
                >
                  {current.button}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center pt-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 text-[8px] font-semibold text-white/70">
                {String(index + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
              </span>

              <div className="flex max-w-[220px] items-center gap-1 overflow-hidden md:max-w-none">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Show ${slide.label} slide`}
                    onClick={() => setIndex(slideIndex)}
                    className={`h-[2px] shrink-0 rounded-full transition-all duration-300 ${
                      slideIndex === index
                        ? "w-6 bg-white md:w-8"
                        : "w-2 bg-white/25 hover:bg-white/50 md:w-3"
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
