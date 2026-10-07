"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type DemoFeaturedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  href: string;
};

const demoProducts: DemoFeaturedProduct[] = [
  {
    id: "demo-product-1",
    name: "Essential White Tee",
    description:
      "A clean everyday essential with a balanced weight, relaxed structure and an easy fit built for repeat wear.",
    price: 799,
    image: "/images/product-1.png",
    href: "/products",
  },
  {
    id: "demo-product-2",
    name: "Daily White Tee",
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
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);

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

    const changeProduct = () => {
      setVisible(false);

      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }

      transitionTimerRef.current = window.setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => setVisible(true));
        });

        transitionTimerRef.current = null;
      }, 380);
    };

    const timer = window.setInterval(changeProduct, 5000);

    return () => {
      window.clearInterval(timer);
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [items.length, reducedMotion]);

  const current = items[index] ?? items[0];
  if (!current) return null;


  return (
    <section
      className="relative overflow-hidden bg-[#001cac] text-white"
      aria-label="Featured products"
    >
      <div className="mx-auto grid min-h-[68svh] w-full max-w-[1440px] grid-cols-1 lg:min-h-[74dvh] lg:grid-cols-2">
        <div className="order-2 flex items-center px-5 py-12 sm:px-8 sm:py-16 lg:order-1 lg:px-14 lg:py-20 xl:px-20">
          <div
            key={"copy-" + current.id + "-" + index}
            className={"featured-motion-copy max-w-[560px] " + (visible ? "is-visible" : "is-hidden")}
          >
            <h2 className="m-0 max-w-[520px] text-[clamp(38px,5.6vw,78px)] font-semibold leading-[.9] tracking-[-.06em]">
              {current.name}
            </h2>

            <p className="mt-6 max-w-[460px] text-[13px] leading-6 text-white/72 sm:text-[14px] sm:leading-7">
              {current.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <strong className="text-[17px] font-semibold tracking-[-.02em]">
                {money(current.price)}
              </strong>

              <Link
                href={current.href}
                className="inline-flex min-h-10 items-center justify-center border border-white/30 bg-white/10 px-5 text-[9px] font-semibold uppercase tracking-[.08em] text-white backdrop-blur-sm transition hover:bg-white hover:text-[#001cac]"
              >
                View product
              </Link>
            </div>

          </div>
        </div>

        <div className="order-1 flex min-h-[46svh] items-center justify-center overflow-hidden px-5 py-8 sm:min-h-[52svh] sm:px-8 lg:order-2 lg:min-h-0 lg:px-10 lg:py-12">
          <div
            key={"image-" + current.id + "-" + index}
            className={"featured-motion-image relative flex h-full min-h-[42svh] w-full items-center justify-center lg:min-h-[62vh] " + (visible ? "is-visible" : "is-hidden")}
          >
            <div className="absolute inset-[8%] rounded-full bg-white/[.06] blur-3xl" />
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
        .featured-motion-copy,
        .featured-motion-image {
          will-change: opacity, transform, filter;
        }

        .featured-motion-copy {
          transition:
            opacity 380ms ease,
            transform 720ms cubic-bezier(.16,1,.3,1),
            filter 420ms ease;
        }

        .featured-motion-image {
          transition:
            opacity 420ms ease,
            transform 900ms cubic-bezier(.16,1,.3,1),
            filter 460ms ease;
        }

        .featured-motion-copy.is-visible,
        .featured-motion-image.is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }

        .featured-motion-copy.is-hidden {
          opacity: 0;
          transform: translate3d(-28px, 0, 0);
          filter: blur(2px);
        }

        .featured-motion-image.is-hidden {
          opacity: 0;
          transform: translate3d(42px, 0, 0) scale(.985);
          filter: blur(1.5px);
        }

        @media (max-width: 1023px) {
          .featured-motion-copy.is-hidden {
            transform: translate3d(-18px, 0, 0);
          }

          .featured-motion-image.is-hidden {
            transform: translate3d(28px, 0, 0) scale(.99);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .featured-motion-copy,
          .featured-motion-image {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </section>
  );
}