"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductScrollFeature({ products }: { products: Product[] }) {
  const items = useMemo(
    () => products.filter((item) => item.image).slice(0, 3),
    [products],
  );
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !items.length) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const scrollable = Math.max(1, rect.height - vh);
      const raw = Math.min(1, Math.max(0, -rect.top / scrollable));

      setProgress(raw);

      const nextIndex = Math.min(
        items.length - 1,
        Math.floor(raw * items.length),
      );

      setActiveIndex((current) =>
        current === nextIndex ? current : nextIndex,
      );
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
  }, [items.length]);

  if (!items.length) return null;

  const current = items[activeIndex];
  const localProgress =
    items.length > 1
      ? Math.min(1, Math.max(0, progress * items.length - activeIndex))
      : progress;

  const titleScale = 1.08 - localProgress * 0.14;
  const imageScale = 0.96 + localProgress * 0.04;

  return (
    <section
      ref={sectionRef}
      className="product-scroll-feature"
      style={{ height: `${Math.max(190, items.length * 95)}svh` }}
      aria-label="Featured products"
    >
      <div className="product-scroll-sticky">
        <div className="product-scroll-panel">
          <div className="product-scroll-copy">
            <div className="product-scroll-topline">
              <span>FEATURED / 0{activeIndex + 1}</span>
              <span>0{items.length}</span>
            </div>

            <div className="product-scroll-main">
              <p>{current.category}</p>

              <h2
                key={current.id}
                style={{ transform: `scale(${titleScale})` }}
              >
                {current.name}
              </h2>

              <div className="product-scroll-price">
                <strong>{money(current.price)}</strong>
                {current.compareAtPrice ? (
                  <del>{money(current.compareAtPrice)}</del>
                ) : null}
              </div>

              <Link
                href={`/products/${current.slug}`}
                className="product-scroll-link"
              >
                View product <span>→</span>
              </Link>
            </div>

            <div className="product-scroll-progress">
              {items.map((item, index) => (
                <span
                  key={item.id}
                  className={index === activeIndex ? "active" : ""}
                />
              ))}
            </div>
          </div>

          <div className="product-scroll-media">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`product-scroll-image-layer ${
                  index === activeIndex ? "active" : ""
                }`}
                style={
                  index === activeIndex
                    ? { transform: `scale(${imageScale})` }
                    : undefined
                }
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 760px) 100vw, 58vw"
                    className="product-scroll-image"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
