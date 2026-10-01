"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  readTestimonials,
  writeTestimonials,
  TESTIMONIAL_UPDATED_EVENT,
} from "@/lib/testimonials";
import type { Testimonial } from "@/types/testimonial";

export function AdminDashboardTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    const sync = () => setItems(readTestimonials());
    sync();
    window.addEventListener(TESTIMONIAL_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(TESTIMONIAL_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const pending = useMemo(
    () =>
      items
        .filter((item) => item.pending)
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [items],
  );

  function approve(id: string) {
    const next = items.map((item) =>
      item.id === id ? { ...item, pending: false, enabled: true } : item,
    );
    setItems(next);
    writeTestimonials(next);
  }

  return (
    <section className="rounded-[20px] border border-black/[.07] bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-black/35">
            Approval queue
          </p>
          <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
            Testimonials
          </h2>
        </div>
        <div className="grid h-9 min-w-9 place-items-center rounded-full bg-[#eef2ff] px-2 text-[10px] font-bold text-[#001cac]">
          {pending.length}
        </div>
      </div>

      {pending.length ? (
        <div className="mt-4 grid gap-2">
          {pending.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-[15px] border border-black/[.06] bg-[#fafaf8] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-[10px] font-semibold">
                    {item.name}
                  </strong>
                  <p className="mt-1 line-clamp-2 text-[8px] leading-4 text-black/45">
                    {item.quote}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => approve(item.id)}
                  className="shrink-0 rounded-full bg-[#001cac] px-3 py-2 text-[8px] font-semibold text-white"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[15px] bg-[#f7f7f4] px-4 py-5">
          <strong className="text-[10px] font-semibold">All caught up</strong>
          <p className="mt-1 text-[8px] leading-4 text-black/40">
            New customer submissions will appear here for approval.
          </p>
        </div>
      )}

      <Link
        href="/admin/testimonials"
        className="mt-4 inline-flex min-h-9 items-center text-[8px] font-semibold text-[#001cac]"
      >
        Manage testimonials
        <span className="ml-1.5" aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
