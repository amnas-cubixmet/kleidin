"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DemoFeaturedProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  href: string;
};

const demoProducts: DemoFeaturedProduct[] = [
  {
    id: "demo-product-1",
    name: "Essential White Tee",
    category: "T-Shirts",
    description:
      "A clean everyday essential with a balanced weight, relaxed structure and an easy fit built for repeat wear.",
    price: 799,
    image: "/images/product-1.png",
    href: "/products",
  },
  {
    id: "demo-product-2",
    name: "Daily White Tee",
    category: "T-Shirts",
    description:
      "Soft, minimal and versatile. Designed with a comfortable silhouette and a clean finish for everyday styling.",
    price: 899,
    image: "/images/product-2.png",
    href: "/products",
  },
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FeaturedProductMotion() {
  const items = demoProducts;

  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();

    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (index < items.length) return;
    setIndex(0);
  }, [index, items.length]);

  useEffect(() => {
    if (items.length <= 1 || reducedMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [items.length, reducedMotion]);

  const current = items[index] ?? items[0];
  if (!current) return null;


  return (
    <section
      className="relative overflow-hidden border-y border-black/10 bg-[#f7f5ef] text-[#111]"
      aria-label="Featured products"
    >
      <div className="mx-auto grid min-h-[68svh] w-full max-w-[1440px] grid-cols-1 lg:min-h-[74dvh] lg:grid-cols-2">
        <div className="order-2 flex items-center px-5 py-12 sm:px-8 sm:py-16 lg:order-1 lg:px-14 lg:py-20 xl:px-20">
          <div
            key={"copy-" + current.id + "-" + index}
            className="featured-motion-copy max-w-[560px]"
          >
            <div className="mb-5 flex items-center gap-5 text-[9px] font-semibold uppercase tracking-[.14em] text-black/42">
              <span>Featured product</span>
              <span className="text-black/30">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")}
              </span>
            </div>

            <p className="m-0 text-[10px] font-semibold uppercase tracking-[.14em] text-black/50">
              {current.category}
            </p>

            <h2 className="mt-3 max-w-[520px] text-[clamp(38px,5.6vw,78px)] font-semibold leading-[.9] tracking-[-.06em]">
              {current.name}
            </h2>

            <p className="mt-6 max-w-[460px] text-[13px] leading-6 text-black/55 sm:text-[14px] sm:leading-7">
              {current.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <strong className="text-[17px] font-semibold tracking-[-.02em]">
                {money(current.price)}
              </strong>

              <Link
                href={current.href}
                className="inline-flex min-h-10 items-center justify-center border border-black/15 bg-white/60 px-5 text-[9px] font-semibold uppercase tracking-[.08em] text-[#111] transition hover:bg-white"
              >
                View product
              </Link>
            </div>

            {items.length > 1 ? (
              <div className="mt-10 flex items-center gap-1.5">
                {items.map((product, productIndex) => (
                  <button
                    key={product.id}
                    type="button"
                    aria-label={"Show " + product.name}
                    aria-current={productIndex === index ? "true" : undefined}
                    onClick={() => setIndex(productIndex)}
                    className={
                      "h-[3px] transition-all duration-300 " +
                      (productIndex === index
                        ? "w-9 bg-black"
                        : "w-4 bg-black/18 hover:bg-black/35")
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="order-1 flex min-h-[46svh] items-center justify-center overflow-hidden px-5 py-8 sm:min-h-[52svh] sm:px-8 lg:order-2 lg:min-h-0 lg:px-10 lg:py-12">
          <div
            key={"image-" + current.id + "-" + index}
            className="featured-motion-image relative flex h-full min-h-[42svh] w-full items-center justify-center lg:min-h-[62vh]"
          >
            <div className="absolute inset-[8%] rounded-full bg-black/[.025] blur-3xl" />
            <img
              src={current.image}
              alt={current.name}
              draggable={false}
              className="relative z-10 max-h-[58svh] w-auto max-w-[92%] select-none object-contain drop-shadow-[0_28px_42px_rgba(0,0,0,.12)] lg:max-h-[68vh]"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .featured-motion-copy {
          animation: featuredCopyIn 760ms cubic-bezier(.16,1,.3,1) both;
        }

        .featured-motion-image {
          animation: featuredImageIn 900ms cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes featuredCopyIn {
          from {
            opacity: 0;
            transform: translateX(-56px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes featuredImageIn {
          from {
            opacity: 0;
            transform: translateX(72px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @media (max-width: 1023px) {
          @keyframes featuredCopyIn {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes featuredImageIn {
            from {
              opacity: 0;
              transform: translateX(38px) scale(.97);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .featured-motion-copy,
          .featured-motion-image {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
