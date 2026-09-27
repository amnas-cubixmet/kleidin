"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/product";

export function ProductVisual({
  image,
  name,
  category,
}: {
  image?: string;
  name: string;
  category: string;
}) {
  return (
    <div className="showcase-visual-wrap">
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          className="showcase-visual-img"
        />
      ) : (
        <div className="showcase-visual-placeholder">
          <span>{category}</span>
        </div>
      )}
      <div className="showcase-visual-overlay" />
    </div>
  );
}

export function ProductInfo({ product }: { product: Product }) {
  return (
    <div className="showcase-info-content">
      <span className="showcase-badge">{product.category}</span>
      <h2 className="showcase-title">{product.name}</h2>
      <p className="showcase-desc">
        {product.description || "Designed for effortless elegance and timeless wardrobe style."}
      </p>

      <div className="showcase-meta-row">
        <span className="showcase-price">₹{product.price.toLocaleString("en-IN")}</span>
        {product.colors?.length ? (
          <span className="showcase-colors">{product.colors.join(" • ")}</span>
        ) : null}
      </div>

      <div className="showcase-actions">
        <Link href={`/products/${product.slug}`} className="showcase-cta">
          View Details <span>→</span>
        </Link>
      </div>
    </div>
  );
}

export function ShowcaseSlide({
  product,
  isActive,
  isPrev,
  isNext,
  slideIndex,
  totalSlides,
}: {
  product: Product;
  isActive: boolean;
  isPrev: boolean;
  isNext: boolean;
  slideIndex: number;
  totalSlides: number;
}) {
  let stateClass = "slide-hidden";
  if (isActive) stateClass = "slide-active";
  else if (isPrev) stateClass = "slide-prev";
  else if (isNext) stateClass = "slide-next";

  return (
    <article
      className={`showcase-slide ${stateClass}`}
      aria-hidden={!isActive}
      data-index={slideIndex}
    >
      <div className="showcase-slide-inner">
        <div className="showcase-copy-col">
          <span className="showcase-counter">
            0{slideIndex + 1} / 0{totalSlides}
          </span>
          <ProductInfo product={product} />
        </div>

        <div className="showcase-media-col">
          <ProductVisual
            image={product.image}
            name={product.name}
            category={product.category}
          />
        </div>
      </div>
    </article>
  );
}

export function ScrollProgress({
  active,
  total,
  onSelect,
}: {
  active: number;
  total: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="showcase-progress-bar" aria-label="Showcase navigation">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`showcase-progress-dot ${i === active ? "active" : ""}`}
          onClick={() => onSelect(i)}
          aria-label={`Go to product ${i + 1}`}
        >
          <span className="showcase-progress-fill" />
        </button>
      ))}
    </div>
  );
}

export function ScrollShowcase({ products }: { products: Product[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || products.length <= 1) return;

    function handleScroll() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;

      if (totalScrollableHeight <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(
        1,
        Math.max(0, currentScroll / totalScrollableHeight)
      );

      const targetIndex = Math.min(
        products.length - 1,
        Math.floor(progress * products.length)
      );

      setActiveIndex(targetIndex);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [products.length]);

  if (!products.length) return null;

  const heightMultiplier = Math.max(1.8, products.length * 1.2);

  return (
    <section
      ref={containerRef}
      className="scroll-showcase-container"
      style={{ height: `${heightMultiplier * 100}vh` }}
    >
      <div className="scroll-showcase-sticky">
        <div className="showcase-header">
          <p className="showcase-kicker">CURATED COLLECTION</p>
          <h2 className="showcase-main-heading">The Edit Showcase</h2>
        </div>

        <div className="showcase-stage">
          {products.map((product, idx) => (
            <ShowcaseSlide
              key={product.id}
              product={product}
              isActive={idx === activeIndex}
              isPrev={idx === activeIndex - 1}
              isNext={idx === activeIndex + 1}
              slideIndex={idx}
              totalSlides={products.length}
            />
          ))}
        </div>

        <ScrollProgress
          active={activeIndex}
          total={products.length}
          onSelect={(i) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const totalScrollableHeight = rect.height - window.innerHeight;
            const targetScrollTop =
              window.scrollY +
              rect.top +
              (i / (products.length - 1 || 1)) * totalScrollableHeight;
            window.scrollTo({ top: targetScrollTop, behavior: "smooth" });
          }}
        />
      </div>
    </section>
  );
}
