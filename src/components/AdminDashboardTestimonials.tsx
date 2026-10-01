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
    <section className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
            Approval queue
          </p>
          <h2 className="mt-1.5 text-[20px] sm:text-[21px] font-semibold tracking-[-.04em]">
            Testimonials
          </h2>
        </div>
        <div className="grid h-8 min-w-8 sm:h-9 sm:min-w-9 place-items-center rounded-full bg-[#eef2ff] px-2 text-[10px] font-bold text-[#001cac]">
          {pending.length}
        </div>
      </div>

      {pending.length ? (
        <div className="mt-4 grid gap-2">
          {pending.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-[13px] border border-[#e2e5eb] bg-[#f7f8fb] p-3 sm:rounded-[15px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-[10px] font-semibold">
                    {item.name}
                  </strong>
                  <p className="mt-1 line-clamp-2 text-[8px] leading-4 text-[#68717d]">
                    {item.quote}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => approve(item.id)}
                  className="shrink-0 rounded-full bg-[#001cac] px-3 py-1.5 text-[8px] font-bold text-white"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3.5 rounded-[14px] bg-[#f7f8fb] px-4 py-4 sm:mt-4 sm:rounded-[15px] sm:py-5">
          <strong className="text-[10px] font-semibold">All caught up</strong>
          <p className="mt-1 text-[8px] leading-4 text-[#68717d]">
            New customer submissions will appear here for approval.
          </p>
        </div>
      )}

      <Link
        href="/admin/testimonials"
        className="mt-3.5 inline-flex min-h-8 items-center text-[8px] font-bold sm:mt-4 text-[#001cac]"
      >
        Manage testimonials
        <span className="ml-1.5" aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
