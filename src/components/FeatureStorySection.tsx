"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Offer } from "@/types/commerce";
import type { Product } from "@/types/product";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

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

export function FeatureStorySection({
  product,
  offer,
}: {
  product: Product;
  offer?: Offer | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
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
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      if (window.matchMedia("(max-width: 760px)").matches) {
        setActiveSlide(0);
        return;
      }

      const rect = section.getBoundingClientRect();
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const scrollable = Math.max(1, rect.height - vh);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

      setActiveSlide(progress < 0.5 ? 0 : 1);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const timerItems = [
    ["Days", pad(timeLeft.days)],
    ["Hours", pad(timeLeft.hours)],
    ["Minutes", pad(timeLeft.minutes)],
    ["Seconds", pad(timeLeft.seconds)],
  ];

  return (
    <section ref={sectionRef} className="feature-story-section">
      <div className="feature-story-sticky">
        <div className="feature-story-frame">
          <article
            className={"feature-story-slide product-slide " + (activeSlide === 0 ? "active" : "")}
          >
            <div className="feature-story-copy">
              <div className="feature-story-index">
                <span>01</span>
                <span>PRODUCT</span>
              </div>

              <div className="feature-story-main">
                <p>{product.category}</p>
                <h2>{product.name}</h2>

                <div className="feature-story-price">
                  <strong>{formatPrice(product.price)}</strong>
                  {product.compareAtPrice ? (
                    <del>{formatPrice(product.compareAtPrice)}</del>
                  ) : null}
                </div>

                <Link
                  href={"/products/" + product.slug}
                  className="feature-story-button"
                >
                  View product
                </Link>
              </div>

              <div className="feature-story-progress" aria-hidden="true">
                <span className="active" />
                <span />
              </div>
            </div>

            <div className="feature-story-media">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 760px) 100vw, 58vw"
                  className="feature-story-image"
                />
              ) : null}
            </div>
          </article>

          {offer ? (
            <article
              className={"feature-story-slide offer-slide " + (activeSlide === 1 ? "active" : "")}
            >
              <div className="feature-story-copy feature-story-offer-copy">
                <div className="feature-story-index">
                  <span>02</span>
                  <span>OFFER</span>
                </div>

                <div className="feature-story-main">
                  <p>{offer.badge}</p>
                  <h2>
                    {offer.discountText}
                    <br />
                    OFF
                  </h2>

                  <p className="feature-story-offer-text">{offer.description}</p>

                  {offer.endsAt ? (
                    <div className="feature-story-timer" aria-label="Offer countdown">
                      {timerItems.map(([label, value]) => (
                        <div key={label}>
                          <strong>{value}</strong>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <Link href={offer.ctaHref} className="feature-story-button">
                    {offer.ctaLabel}
                  </Link>
                </div>

                <div className="feature-story-progress" aria-hidden="true">
                  <span />
                  <span className="active" />
                </div>
              </div>

              <div className="feature-story-media">
                {offer.imageUrl ? (
                  <Image
                    src={offer.imageUrl}
                    alt={offer.title}
                    fill
                    sizes="(max-width: 760px) 100vw, 58vw"
                    className="feature-story-image"
                  />
                ) : null}
                <div className="feature-story-offer-overlay" />
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
