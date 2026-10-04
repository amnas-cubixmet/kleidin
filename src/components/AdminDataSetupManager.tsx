"use client";

import { useState } from "react";

type SeedResult = {
  mode: string;
  publicVisibility: Record<string, string>;
  products: { created: number; skipped: number; imagesUploaded: number };
  orders: { created: number; skipped: number };
  testimonials: { created: number; skipped: number };
  hero: { created: number; skipped: number };
  announcements: { created: number; skipped: number };
  warnings: string[];
};

export function AdminDataSetupManager() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState("");

  async function seed() {
    if (
      !window.confirm(
        "Load realistic INTERNAL test data into the connected MongoDB Atlas database? Products will stay draft and storefront content will stay disabled.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch("/api/admin/seed/realistic", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load realistic test data.");
      }

      setResult(data.result as SeedResult);
    } catch (seedError) {
      setError(
        seedError instanceof Error
          ? seedError.message
          : "Could not load realistic test data.",
      );
    } finally {
      setLoading(false);
    }
  }

  const cards = result
    ? [
        [
          "Products",
          result.products.created,
          result.products.skipped,
          result.products.imagesUploaded + " Cloudinary images",
        ],
        ["Orders", result.orders.created, result.orders.skipped, "Admin only"],
        [
          "Reviews",
          result.testimonials.created,
          result.testimonials.skipped,
          "Pending · internal",
        ],
        ["Hero", result.hero.created, result.hero.skipped, "Disabled"],
        [
          "Announcements",
          result.announcements.created,
          result.announcements.skipped,
          "Disabled",
        ],
      ]
    : [];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-[22px] border border-[#d9dde3] bg-white p-5 shadow-[0_10px_34px_rgba(16,24,40,.05)] sm:p-6">
        <div className="max-w-[760px]">
          <span className="inline-flex min-h-[30px] items-center rounded-full bg-[#111111] px-3 text-[8px] font-bold uppercase tracking-[.1em] text-white">
            Internal test data
          </span>

          <h2 className="mt-4 text-[clamp(30px,6vw,48px)] font-semibold leading-[.94] tracking-[-.055em] text-[#17191d]">
            Make the admin feel like a real running store.
          </h2>

          <p className="mt-4 max-w-[680px] text-[11px] leading-6 text-[#626a75]">
            This creates realistic products, colour × size inventory, offers,
            orders, review records, hero drafts and announcements directly in
            MongoDB Atlas. Product photos are copied into Cloudinary.
          </p>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {[
            ["6 products", "Draft only — not visible to customers"],
            ["Real product photos", "Copied to your Cloudinary account"],
            ["Colour × size stock", "S / M / L / XL / 2XL inventory matrix"],
            ["8 orders", "Mixed fulfilment and payment states"],
            ["6 reviews", "Pending and labelled internal test records"],
            ["Hero + announcements", "Created disabled so public UI stays clean"],
          ].map(([title, copy]) => (
            <div
              key={title}
              className="rounded-[16px] border border-[#e0e3e7] bg-[#f7f7f7] p-4"
            >
              <strong className="text-[11px] font-semibold text-[#17191d]">
                {title}
              </strong>
              <p className="mt-1.5 text-[9px] leading-5 text-[#717983]">
                {copy}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[16px] border border-[#ead7a4] bg-[#fffaf0] p-4">
          <strong className="text-[10px] font-semibold text-[#6e5311]">
            Before running
          </strong>
          <p className="mt-1.5 text-[9px] leading-5 text-[#7b6328]">
            Add <code>MONGODB_URI</code> and <code>MONGODB_DB</code> to
            <code> .env.local</code>, run <code>npm run db:setup</code>, and add
            all three Cloudinary environment variables. Running this again is
            safe — known demo records are skipped instead of duplicated.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => void seed()}
          className="mt-6 min-h-[50px] rounded-full bg-[#111111] px-7 text-[10px] font-bold text-white disabled:cursor-wait disabled:opacity-55"
        >
          {loading ? "Loading data into MongoDB Atlas…" : "Load realistic test data"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            if (!window.confirm("Clear only internal demo data from MongoDB Atlas? Real store records will not be touched.")) return;
            try {
              setLoading(true);
              setError("");
              const response = await fetch("/api/admin/seed/realistic", { method: "DELETE" });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || "Could not clear demo data.");
              setResult(null);
            } catch (clearError) {
              setError(clearError instanceof Error ? clearError.message : "Could not clear demo data.");
            } finally {
              setLoading(false);
            }
          }}
          className="ml-2 mt-6 min-h-[50px] rounded-full border border-[#d4d7db] bg-white px-7 text-[10px] font-bold text-[#111111] disabled:opacity-55"
        >
          Clear demo data
        </button>

        {error ? (
          <div className="mt-4 rounded-[14px] border border-[#efcaca] bg-[#fff6f6] px-4 py-3 text-[10px] leading-5 text-[#9a3d3d]">
            {error}
          </div>
        ) : null}
      </section>

      <aside className="grid content-start gap-3">
        <section className="rounded-[22px] border border-[#d9dde3] bg-white p-5">
          <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#777f89]">
            Public visibility
          </p>
          <div className="mt-4 grid gap-2">
            {[
              ["Products", "Draft"],
              ["Reviews", "Pending + disabled"],
              ["Hero", "Disabled"],
              ["Announcements", "Disabled"],
              ["Orders", "Admin only"],
            ].map(([label, state]) => (
              <div
                key={label}
                className="flex min-h-[44px] items-center justify-between gap-3 border-b border-[#eceef1] text-[10px] last:border-0"
              >
                <span className="font-medium text-[#606873]">{label}</span>
                <strong className="text-[#17191d]">{state}</strong>
              </div>
            ))}
          </div>
        </section>

        {result ? (
          <section className="rounded-[22px] border border-[#111111] bg-[#111111] p-5 text-white">
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-white/55">
              Seed completed
            </p>

            <div className="mt-4 grid gap-2">
              {cards.map(([label, created, skipped, note]) => (
                <div
                  key={String(label)}
                  className="rounded-[14px] border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-[10px]">{label}</strong>
                    <span className="text-[9px] text-white/55">
                      +{created} · {skipped} skipped
                    </span>
                  </div>
                  <p className="mt-1 text-[8px] text-white/45">{note}</p>
                </div>
              ))}
            </div>

            {result.warnings.length ? (
              <div className="mt-4 rounded-[12px] bg-white/8 p-3 text-[8px] leading-4 text-white/60">
                {result.warnings.join(" ")}
              </div>
            ) : null}
          </section>
        ) : null}
      </aside>
    </div>
  );
}
