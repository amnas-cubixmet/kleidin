"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { offerHero } from "@/config/offers";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const STORAGE_KEY = "kleidin-offer-hero-end";

function getConfiguredDurationMs() {
  const { days, hours, minutes, seconds } = offerHero.duration;

  return (
    (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000
  );
}

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

export function OfferHero() {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: offerHero.duration.days,
    hours: offerHero.duration.hours,
    minutes: offerHero.duration.minutes,
    seconds: offerHero.duration.seconds,
  });

  useEffect(() => {
    let resolvedEnd = 0;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? Number(stored) : 0;

      if (parsed > Date.now()) {
        resolvedEnd = parsed;
      } else {
        resolvedEnd = Date.now() + getConfiguredDurationMs();
        window.localStorage.setItem(STORAGE_KEY, String(resolvedEnd));
      }
    } catch {
      resolvedEnd = Date.now() + getConfiguredDurationMs();
    }

    setEndAt(resolvedEnd);
    setTimeLeft(getTimeLeft(resolvedEnd));
  }, []);

  useEffect(() => {
    if (!endAt) return;

    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(endAt));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [endAt]);

  const timerItems = useMemo(
    () => [
      { label: "Days", value: pad(timeLeft.days) },
      { label: "Hours", value: pad(timeLeft.hours) },
      { label: "Minutes", value: pad(timeLeft.minutes) },
      { label: "Seconds", value: pad(timeLeft.seconds) },
    ],
    [timeLeft],
  );

  if (!offerHero.enabled) return null;

  return (
    <section className="offer-hero-shell">
      <div className="offer-hero">
        <div className="offer-hero-copy">
          <p className="offer-kicker">{offerHero.badge}</p>

          <h1>
            <span>{offerHero.titlePrefix}</span>
            <span className="offer-discount">{offerHero.discount}</span>
            <span>{offerHero.titleSuffix}</span>
          </h1>

          <p className="offer-description">{offerHero.description}</p>

          <div className="offer-timer" aria-label="Offer countdown">
            {timerItems.map((item) => (
              <div className="offer-time-item" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link href={offerHero.ctaHref} className="offer-cta">
            {offerHero.ctaLabel}
            <span>→</span>
          </Link>

          <div className="offer-benefits">
            {offerHero.benefits.map((benefit, index) => (
              <div className="offer-benefit" key={benefit.title}>
                <span className="offer-benefit-icon" aria-hidden="true">
                  {index === 0 ? "▣" : index === 1 ? "↻" : "◇"}
                </span>
                <div>
                  <strong>{benefit.title}</strong>
                  <small>{benefit.copy}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="offer-hero-media">
          <Image
            src={offerHero.image}
            alt="KLEID.IN limited time offer"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 54vw"
            className="offer-hero-image"
          />
          <div className="offer-media-gradient" />

          <div className="offer-hand-note" aria-hidden="true">
            <span>Style</span>
            <span>People</span>
            <span>A Brighter</span>
            <span>Tomorrow</span>
          </div>
        </div>

        <div className="offer-slide-nav" aria-label="Hero slide">
          <span>01 / 05</span>
          <div className="offer-slide-dots" aria-hidden="true">
            <i className="active" />
            <i />
            <i />
            <i />
            <i />
          </div>
          <button type="button" aria-label="Previous slide">←</button>
          <button type="button" aria-label="Next slide">→</button>
        </div>
      </div>
    </section>
  );
}
