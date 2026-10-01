"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  readTestimonials,
  TESTIMONIAL_UPDATED_EVENT,
} from "@/lib/testimonials";
import type { Testimonial } from "@/types/testimonial";

type Props = {
  productSlug?: string;
  title?: string;
  eyebrow?: string;
};

export function TestimonialsSection({
  productSlug,
  title = "What people say.",
  eyebrow = "TESTIMONIALS",
}: Props) {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    const sync = () => setItems(readTestimonials());
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener(TESTIMONIAL_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(TESTIMONIAL_UPDATED_EVENT, sync);
    };
  }, []);

  const visible = useMemo(
    () =>
      items
        .filter((item) => {
          if (!item.enabled) return false;
          if (productSlug) return item.productSlug === productSlug;
          return item.showOnHome;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [items, productSlug],
  );

  return (
    <section className="mx-auto w-[min(calc(100%_-_24px),1376px)] py-8 md:py-12">
      <div className="mb-5 flex items-end justify-between gap-5 border-b border-black/10 pb-4 md:mb-7">
        <div>
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-[clamp(30px,4.4vw,62px)] font-semibold leading-[.92] tracking-[-.055em] text-[#111]">
            {title}
          </h2>
        </div>
        <span className="hidden text-[8px] text-black/40 sm:block">
          {visible.length ? visible.length + " STORIES" : "ADD FROM ADMIN"}
        </span>
      </div>

      {visible.length ? (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          {visible.map((item) => (
            <article
              key={item.id}
              className="min-h-[220px] rounded-[18px] border border-black/8 bg-[#F4F0E9] p-4 md:min-h-[260px] md:p-5"
            >
              <div className="flex items-center gap-3">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[12px] font-semibold text-black/60">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <strong className="block truncate text-[10px] font-semibold">
                    {item.name}
                  </strong>
                  {item.location ? (
                    <span className="mt-1 block truncate text-[7px] text-black/45">
                      {item.location}
                    </span>
                  ) : null}
                </div>
              </div>

              <div
                className="mt-5 text-[10px] tracking-[.08em] text-[#001cac]"
                aria-label={item.rating + " out of 5 stars"}
              >
                {"★".repeat(Math.max(1, Math.min(5, item.rating)))}
              </div>

              <blockquote className="m-0 mt-4 text-[15px] font-medium leading-[1.35] tracking-[-.025em] text-[#111] md:text-[18px]">
                “{item.quote}”
              </blockquote>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-black/15 bg-white px-5 py-8 text-center">
          <p className="m-0 text-[10px] font-medium text-black/55">
            {productSlug
              ? "No customer testimonial has been published for this product yet."
              : "Testimonials added from Admin will appear here."}
          </p>
        </div>
      )}
    </section>
  );
}
