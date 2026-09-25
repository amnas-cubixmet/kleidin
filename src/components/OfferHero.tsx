"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

export function OfferHero({ offers }: { offers: Offer[] }) {
  const [index, setIndex] = useState(0);
  const current = offers[index] ?? offers[0];
  const deadline = current?.endsAt ? new Date(current.endsAt).getTime() : null;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!deadline) return;

    setTimeLeft(getTimeLeft(deadline));
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  const timerItems = useMemo(
    () => [
      { label: "Days", value: pad(timeLeft.days) },
      { label: "Hours", value: pad(timeLeft.hours) },
      { label: "Minutes", value: pad(timeLeft.minutes) },
      { label: "Seconds", value: pad(timeLeft.seconds) },
    ],
    [timeLeft],
  );

  if (!offers.length || !current) return null;

  function previous() {
    setIndex((value) => (value - 1 + offers.length) % offers.length);
  }

  function next() {
    setIndex((value) => (value + 1) % offers.length);
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

          {deadline ? (
            <div className="offer-timer" aria-label="Offer countdown">
              {timerItems.map((item) => (
                <div className="offer-time-item" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          <Link href={current.ctaHref} className="offer-cta">
            {current.ctaLabel}<span>→</span>
          </Link>
        </div>

        <div className="offer-hero-media">
          {current.imageUrl ? (
            <Image
              key={current.id}
              src={current.imageUrl}
              alt={current.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 54vw"
              className="offer-hero-image"
            />
          ) : null}
          <div className="offer-media-gradient" />
        </div>

        {offers.length > 1 ? (
          <div className="offer-slide-nav" aria-label="Hero slide controls">
            <span>{String(index + 1).padStart(2, "0")} / {String(offers.length).padStart(2, "0")}</span>
            <div className="offer-slide-dots" aria-hidden="true">
              {offers.map((slide, slideIndex) => (
                <i key={slide.id} className={slideIndex === index ? "active" : ""} />
              ))}
            </div>
            <button type="button" onClick={previous} aria-label="Previous slide">←</button>
            <button type="button" onClick={next} aria-label="Next slide">→</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
