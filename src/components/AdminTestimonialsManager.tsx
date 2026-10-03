"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  readTestimonials,
  writeTestimonials,
  TESTIMONIAL_UPDATED_EVENT,
} from "@/lib/testimonials";
import type { Testimonial } from "@/types/testimonial";

type ProductOption = {
  slug: string;
  name: string;
};

type Filter = "all" | "pending" | "published" | "hidden";

function statusOf(item: Testimonial) {
  if (item.pending) return "pending" as const;
  if (item.enabled) return "published" as const;
  return "hidden" as const;
}

export function AdminTestimonialsManager({
  products,
}: {
  products: ProductOption[];
}) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [query, setQuery] = useState("");

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

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.slug, product.name])),
    [products],
  );

  const stats = useMemo(() => {
    const pending = items.filter((item) => item.pending).length;
    const published = items.filter((item) => !item.pending && item.enabled).length;
    const hidden = items.filter((item) => !item.pending && !item.enabled).length;
    return { pending, published, hidden, total: items.length };
  }, [items]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return [...items]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((item) => {
        const status = statusOf(item);
        if (filter !== "all" && status !== filter) return false;

        if (!term) return true;

        const productName = item.productSlug
          ? productNames.get(item.productSlug) ?? item.productSlug
          : "general";

        return [
          item.name,
          item.quote,
          item.location ?? "",
          productName,
        ].some((value) => value.toLowerCase().includes(term));
      });
  }, [filter, items, productNames, query]);

  function persist(next: Testimonial[]) {
    setItems(next);
    writeTestimonials(next);
  }

  function approve(item: Testimonial) {
    persist(
      items.map((current) =>
        current.id === item.id
          ? { ...current, pending: false, enabled: true }
          : current,
      ),
    );
  }

  function togglePublished(item: Testimonial) {
    persist(
      items.map((current) =>
        current.id === item.id
          ? {
              ...current,
              pending: false,
              enabled: !current.enabled,
            }
          : current,
      ),
    );
  }

  function reject(item: Testimonial) {
    if (
      !window.confirm(
        "Reject and permanently remove this customer submission?",
      )
    ) {
      return;
    }

    persist(items.filter((current) => current.id !== item.id));
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "published", label: "Published", count: stats.published },
    { key: "hidden", label: "Hidden", count: stats.hidden },
    { key: "all", label: "All", count: stats.total },
  ];

  return (
    <div className="grid gap-4">
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Pending review", stats.pending],
          ["Published", stats.published],
          ["Hidden", stats.hidden],
          ["Total", stats.total],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-[16px] border border-[#d9dde3] bg-white p-4"
          >
            <span className="text-[9px] font-bold uppercase tracking-[.09em] text-[#727985]">
              {label}
            </span>
            <strong className="mt-2 block text-[24px] font-semibold tracking-[-.04em] text-[#17191d]">
              {value}
            </strong>
          </div>
        ))}
      </section>

      <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Review moderation
            </p>
            <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em] sm:text-[30px]">
              Customer reviews
            </h2>
            <p className="mt-1.5 max-w-[720px] text-[10px] leading-5 text-[#626a75] sm:text-[11px]">
              Customer submissions arrive here for approval. Admin cannot create or rewrite reviews from this page.
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-[46px] w-full rounded-[12px] border border-[#d6dae0] bg-[#f6f6f6] px-4 text-[11px] font-medium outline-none placeholder:text-[#8e959f] focus:border-[#111111] focus:bg-white focus:ring-2 focus:ring-black/10 xl:w-[320px]"
            placeholder="Search customer / product"
          />
        </div>

        <div className="mt-5 rounded-[16px] border border-[#e2e5e9] bg-[#f6f7f8] p-1.5 sm:inline-flex sm:rounded-full">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:gap-1">
            {filters.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={
                    "min-h-[44px] rounded-[12px] px-4 text-[10px] font-bold transition sm:rounded-full sm:px-5 " +
                    (active
                      ? "bg-[#111111] !text-white shadow-[0_4px_12px_rgba(0,0,0,.10)]"
                      : "bg-transparent text-[#4f5761] hover:bg-white")
                  }
                  style={active ? { color: "#fff" } : undefined}
                >
                  {item.label} · {item.count}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length ? (
          <div className="mt-5 grid gap-3">
            {filtered.map((item) => {
              const status = statusOf(item);
              const productName = item.productSlug
                ? productNames.get(item.productSlug) ?? item.productSlug
                : "General store review";

              return (
                <article
                  key={item.id}
                  className="rounded-[18px] border border-[#d9dde3] bg-white p-4 sm:rounded-[20px] sm:p-5"
                >
                  <div className="grid gap-4 md:grid-cols-[84px_minmax(0,1fr)]">
                    <div>
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt="Customer product"
                          width={168}
                          height={168}
                          unoptimized={item.productImage.startsWith("data:")}
                          className="aspect-square w-full max-w-[84px] rounded-[14px] border border-[#e0e3e7] object-cover"
                        />
                      ) : (
                        <div className="grid aspect-square w-[84px] place-items-center rounded-[14px] bg-[#f2f3f4] text-[9px] font-bold text-[#8a919b]">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-[13px] font-semibold text-[#17191d]">
                              {item.name}
                            </strong>
                            <span
                              className={
                                "rounded-full px-2.5 py-1.5 text-[8px] font-bold " +
                                (status === "pending"
                                  ? "bg-[#fff7e8] text-[#8a6100]"
                                  : status === "published"
                                    ? "bg-[#111111] text-white"
                                    : "bg-[#eef0f2] text-[#616975]")
                              }
                            >
                              {status === "pending"
                                ? "Pending"
                                : status === "published"
                                  ? "Published"
                                  : "Hidden"}
                            </span>
                          </div>

                          <p className="mt-1.5 text-[9px] text-[#747c86]">
                            {item.location ? item.location + " · " : ""}
                            {productName}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <div
                            className="text-[12px] tracking-[.08em] text-[#111111]"
                            aria-label={item.rating + " out of 5 stars"}
                          >
                            {"★".repeat(Math.max(1, Math.min(5, item.rating)))}
                            <span className="text-[#d4d7db]">
                              {"★".repeat(Math.max(0, 5 - item.rating))}
                            </span>
                          </div>
                          <span className="mt-1 block text-[8px] text-[#8a919b]">
                            {new Date(item.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <blockquote className="mt-4 rounded-[14px] bg-[#f6f6f6] px-4 py-3.5 text-[11px] leading-6 text-[#434b55]">
                        “{item.quote}”
                      </blockquote>

                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eceef1] pt-4">
                        {item.submittedByCustomer ? (
                          <span className="mr-auto text-[8px] font-bold uppercase tracking-[.08em] text-[#7b828c]">
                            Customer submission
                          </span>
                        ) : (
                          <span className="mr-auto text-[8px] font-bold uppercase tracking-[.08em] text-[#7b828c]">
                            Existing review
                          </span>
                        )}

                        {status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => approve(item)}
                              className="min-h-[44px] rounded-full bg-[#111111] px-5 text-[10px] font-bold !text-white"
                              style={{ color: "#fff" }}
                            >
                              Approve & publish
                            </button>
                            <button
                              type="button"
                              onClick={() => reject(item)}
                              className="min-h-[44px] rounded-full border border-[#efcaca] bg-white px-5 text-[10px] font-bold text-[#a33d3d]"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => togglePublished(item)}
                              className={
                                "min-h-[44px] rounded-full px-5 text-[10px] font-bold " +
                                (status === "published"
                                  ? "border border-[#d5d9df] bg-white text-[#4e5660]"
                                  : "bg-[#111111] !text-white")
                              }
                              style={
                                status === "hidden" ? { color: "#fff" } : undefined
                              }
                            >
                              {status === "published" ? "Hide" : "Publish"}
                            </button>
                            <button
                              type="button"
                              onClick={() => reject(item)}
                              className="min-h-[44px] rounded-full border border-[#efcaca] bg-white px-5 text-[10px] font-bold text-[#a33d3d]"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 grid min-h-[240px] place-items-center rounded-[16px] bg-[#f5f5f5] px-5 text-center">
            <div>
              <strong className="text-[13px] font-semibold">
                {filter === "pending" ? "No reviews waiting" : "No reviews found"}
              </strong>
              <p className="mt-2 text-[10px] leading-5 text-[#68717b]">
                {filter === "pending"
                  ? "New customer submissions will appear here for approval."
                  : "Try another search or review status."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
