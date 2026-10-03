"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

function money(value?: number) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load products.");
      setConfigured(data.configured !== false);
      setProducts(data.products ?? []);
      setMessage(data.error ?? "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [
        product.name,
        product.sku,
        product.slug,
        product.category,
        product.status,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [products, query]);

  const active = products.filter((item) => item.status === "active").length;
  const wholesale = products.filter((item) => item.wholesaleEnabled).length;
  const lowStock = products.filter((item) => item.stock <= 10).length;

  return (
    <div className="grid gap-4">
      {!configured ? (
        <div className="rounded-[16px] border border-[#d9dde3] bg-[#f6f6f6] p-4 text-[10px] leading-5 text-[#555d67]">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-[11px] text-[#17191d]">Demo products active</strong>
            <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[8px] font-bold !text-white" style={{ color: "#fff" }}>
              FAKE DATA
            </span>
          </div>
          <p className="mt-1.5">
            These products are realistic local demo data for UI testing. Connect Supabase to switch this page to the real product database.
          </p>
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Products", products.length],
          ["Active", active],
          ["Wholesale", wholesale],
          ["Low stock", lowStock],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-[16px] border border-[#d9dde3] bg-white p-4"
          >
            <span className="text-[9px] font-bold uppercase tracking-[.09em] text-[#727985]">
              {label}
            </span>
            <strong className="mt-2 block text-[24px] font-semibold tracking-[-.04em]">
              {value}
            </strong>
          </div>
        ))}
      </section>

      <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Catalog
            </p>
            <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em] sm:text-[30px]">
              Products
            </h2>
            <p className="mt-1.5 text-[10px] leading-5 text-[#626a75] sm:text-[11px]">
              {configured
                ? "Retail and wholesale product records stored in the product database."
                : "Retail and wholesale demo products for local testing."}
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-[46px] w-full rounded-[12px] border border-[#d6dae0] bg-[#f6f6f6] px-4 text-[11px] font-medium outline-none placeholder:text-[#8e959f] focus:border-[#111111] focus:bg-white focus:ring-2 focus:ring-black/10 sm:w-[320px]"
            placeholder="Search products"
          />
        </div>

        {loading ? (
          <div className="mt-5 grid min-h-[240px] place-items-center rounded-[16px] bg-[#f5f5f5] text-[11px] font-semibold text-[#6d7580]">
            Loading products…
          </div>
        ) : filtered.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => {
              const preview =
                product.image ||
                product.colorVariants?.[0]?.images?.[0] ||
                product.colorVariants?.[0]?.image;

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[18px] border border-[#d9dde3] bg-white transition hover:border-[#111111] hover:shadow-[0_10px_28px_rgba(16,24,40,.06)]"
                >
                  <div className="aspect-[4/3] bg-[#f3f3f3]">
                    {preview ? (
                      <img
                        src={preview}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[10px] font-semibold text-[#8a919b]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#111111] px-2.5 py-1.5 text-[8px] font-bold text-white">
                        {product.status}
                      </span>
                      {product.wholesaleEnabled ? (
                        <span className="rounded-full bg-[#efefef] px-2.5 py-1.5 text-[8px] font-bold text-[#444b54]">
                          Wholesale
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 text-[15px] font-semibold tracking-[-.025em]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-[9px] text-[#7b828d]">
                      {product.sku} · {product.category}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-[14px] bg-[#f5f5f5] p-3">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#777f89]">
                          Retail
                        </span>
                        <strong className="mt-1 block text-[14px]">
                          {money(product.price)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#777f89]">
                          Wholesale
                        </span>
                        <strong className="mt-1 block text-[14px]">
                          {product.wholesaleEnabled
                            ? money(product.wholesalePrice)
                            : "Off"}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold text-[#626a75]">
                        Stock {product.stock}
                      </span>
                      <Link
                        href={"/admin/products/" + product.id}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#111111] px-5 text-[10px] font-bold text-white"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 grid min-h-[260px] place-items-center rounded-[16px] bg-[#f5f5f5] px-5 text-center">
            <div>
              <strong className="text-[13px] font-semibold">No products found</strong>
              <p className="mt-2 text-[10px] leading-5 text-[#68717b]">
                Use Add product to create the first database product.
              </p>
            </div>
          </div>
        )}

        {message && configured ? (
          <p className="mt-4 text-[10px] font-semibold text-[#9a3d3d]">{message}</p>
        ) : null}
      </section>
    </div>
  );
}
