"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Testimonial } from "@/types/testimonial";

export function AdminDashboardTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/testimonials", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load reviews.");
        return (data.testimonials ?? []) as Testimonial[];
      })
      .then((reviews) => {
        if (active) setItems(reviews);
      })
      .catch(() => {
        if (active) setItems([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const pending = useMemo(
    () =>
      items
        .filter((item) => item.pending)
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [items],
  );

  async function approve(item: Testimonial) {
    try {
      setBusyId(item.id);
      const response = await fetch("/api/admin/testimonials/" + item.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pending: false, enabled: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not approve review.");

      const updated = data.testimonial as Testimonial;
      setItems((current) =>
        current.map((review) => (review.id === updated.id ? updated : review)),
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
            Approval queue
          </p>
          <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-.04em] sm:text-[24px]">
            Testimonials
          </h2>
        </div>
        <div className="grid h-9 min-w-9 place-items-center rounded-full bg-[#111111] px-2 text-[11px] font-bold text-white">
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
                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#68717d]">
                    {item.quote}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void approve(item)}
                  className="min-h-[44px] shrink-0 rounded-full bg-[#111111] px-4 py-2 text-[10px] font-bold text-white disabled:opacity-50"
                >
                  {busyId === item.id ? "Saving…" : "Approve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[15px] bg-[#f7f8fb] px-4 py-5">
          <strong className="text-[10px] font-semibold">All caught up</strong>
          <p className="mt-1 text-[10px] leading-4 text-[#68717d]">
            New customer submissions will appear here for approval.
          </p>
        </div>
      )}

      <Link
        href="/admin/testimonials"
        className="mt-4 inline-flex min-h-[44px] items-center text-[10px] font-bold text-[#111111]"
      >
        Manage testimonials
        <span className="ml-1.5" aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
