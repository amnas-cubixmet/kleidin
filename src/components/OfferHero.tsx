"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { offerHero as fallback } from "@/config/offers";
import type { Offer } from "@/types/commerce";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(endAt: number): TimeLeft {
  const remaining = Math.max(0, endAt - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function fallbackOffer(): Offer {
  return {
    id: "fallback",
    title: "Limited Time Offer",
    badge: fallback.badge,
    discountText: fallback.discount,
    description: fallback.description,
    ctaLabel: fallback.ctaLabel,
    ctaHref: fallback.ctaHref,
    imageUrl: fallback.image,
    startsAt: null,
    endsAt: new Date(
      Date.now() +
        (((fallback.duration.days * 24 + fallback.duration.hours) * 60 +
          fallback.duration.minutes) *
          60 +
          fallback.duration.seconds) *
          1000,
    ).toISOString(),
    enabled: true,
    priority: 0,
  };
}

export function OfferHero({ offers }: { offers: Offer[] }) {
  const slides = offers.length ? offers : [fallbackOffer()];
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];
  const initialEnd = current.endsAt ? new Date(current.endsAt).getTime() : Date.now() + 86400000;
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(initialEnd));

  useEffect(() => {
    setTimeLeft(getTimeLeft(current.endsAt ? new Date(current.endsAt).getTime() : Date.now() + 86400000));

    const timer = window.setInterval(() => {
      const end = current.endsAt ? new Date(current.endsAt).getTime() : Date.now() + 86400000;
      setTimeLeft(getTimeLeft(end));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [current]);

  const timerItems = useMemo(
    () => [
      { label: "Days", value: pad(timeLeft.days) },
      { label: "Hours", value: pad(timeLeft.hours) },
      { label: "Minutes", value: pad(timeLeft.minutes) },
      { label: "Seconds", value: pad(timeLeft.seconds) },
    ],
    [timeLeft],
  );

  function previous() {
    setIndex((value) => (value - 1 + slides.length) % slides.length);
  }

  function next() {
    setIndex((value) => (value + 1) % slides.length);
  }

  return (
    <section className="offer-hero-shell">
      <div className="offer-hero">
        <div className="offer-hero-copy">
          <p className="offer-kicker">{current.badge}</p>
          <h1>
            <span>FLAT</span>
            <span className="offer-discount">{current.discountText}</span>
            <span>OFF</span>
          </h1>
          <p className="offer-description">{current.description}</p>

          <div className="offer-timer" aria-label="Offer countdown">
            {timerItems.map((item) => (
              <div className="offer-time-item" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link href={current.ctaHref} className="offer-cta">
            {current.ctaLabel}<span>→</span>
          </Link>

          <div className="offer-benefits">
            <div className="offer-benefit"><span className="offer-benefit-icon">▣</span><div><strong>Free Shipping</strong><small>on orders over ₹1,999</small></div></div>
            <div className="offer-benefit"><span className="offer-benefit-icon">↻</span><div><strong>Easy Returns</strong><small>7 days hassle free</small></div></div>
            <div className="offer-benefit"><span className="offer-benefit-icon">◇</span><div><strong>Premium Quality</strong><small>Everyday essentials</small></div></div>
          </div>
        </div>

        <div className="offer-hero-media">
          <Image
            key={current.id}
            src={current.imageUrl || fallback.image}
            alt={current.title}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 54vw"
            className="offer-hero-image"
          />
          <div className="offer-media-gradient" />
          <div className="offer-hand-note" aria-hidden="true">
            <span>Style</span><span>People</span><span>A Brighter</span><span>Tomorrow</span>
          </div>
        </div>

        <div className="offer-slide-nav" aria-label="Hero slide controls">
          <span>{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <div className="offer-slide-dots" aria-hidden="true">
            {slides.map((slide, slideIndex) => (
              <i key={slide.id} className={slideIndex === index ? "active" : ""} />
            ))}
          </div>
          <button type="button" onClick={previous} aria-label="Previous slide">←</button>
          <button type="button" onClick={next} aria-label="Next slide">→</button>
        </div>
      </div>
    </section>
  );
}
