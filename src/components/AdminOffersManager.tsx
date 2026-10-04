"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import {
  getProductOfferPrice,
  getProductOfferStatus,
} from "@/lib/product-offers";
import {
  DEMO_ADMIN_PRODUCTS_UPDATED_EVENT,
  readDemoAdminProducts,
} from "@/lib/demo-admin-products-client";

type Filter = "all" | "active" | "scheduled" | "expired" | "off";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function offerValueText(product: Product) {
  if (!product.offerEnabled || !product.offerValue) return "No offer";
  if (product.offerType === "percentage") return product.offerValue + "% OFF";
  if (product.offerType === "fixed") return money(product.offerValue) + " OFF";
  return money(product.offerValue);
}

export function AdminOffersManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [configured, setConfigured] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/products", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load offers.");
        if (!active) return;
        setConfigured(true);
        setProducts((data.products ?? []) as Product[]);
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load offers.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const base = { active: 0, scheduled: 0, expired: 0, off: 0 };
    for (const product of products) {
      const status = getProductOfferStatus(product);
      base[status] += 1;
    }
    return base;
  }, [products]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return products
      .filter((product) => {
        const status = getProductOfferStatus(product);
        if (filter !== "all" && status !== filter) return false;
        if (!term) return true;
        return [product.name, product.sku, product.category, product.offerLabel ?? ""]
          .some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => {
        const rank = { active: 0, scheduled: 1, expired: 2, off: 3 };
        return rank[getProductOfferStatus(a)] - rank[getProductOfferStatus(b)];
      });
  }, [filter, products, query]);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: products.length },
    { key: "active", label: "Active", count: counts.active },
    { key: "scheduled", label: "Scheduled", count: counts.scheduled },
    { key: "expired", label: "Expired", count: counts.expired },
    { key: "off", label: "Off", count: counts.off },
  ];

  return (
    <div className="grid gap-4">
      {!configured ? (
        <div className="rounded-[16px] border border-[#e0c2c2] bg-[#fff6f6] p-4 text-[10px] leading-5 text-[#8a3636]">
          Supabase is required for offer management.
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Active", counts.active],
          ["Scheduled", counts.scheduled],
          ["Expired", counts.expired],
          ["Offer off", counts.off],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[16px] border border-[#d9dde3] bg-white p-4">
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Product promotions
            </p>
            <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em] sm:text-[30px]">
              Offers
            </h2>
            <p className="mt-1.5 max-w-[620px] text-[10px] leading-5 text-[#626a75] sm:text-[11px]">
              Create always-on or scheduled offers per product. Start/end timing controls activation automatically.
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-[46px] w-full rounded-[12px] border border-[#d6dae0] bg-[#f6f6f6] px-4 text-[11px] font-medium outline-none placeholder:text-[#8e959f] focus:border-[#111111] focus:bg-white focus:ring-2 focus:ring-black/10 lg:w-[320px]"
            placeholder="Search product / SKU"
          />
        </div>

        <div className="mt-5 overflow-x-auto pb-1">
          <div className="inline-flex min-w-max gap-1 rounded-full border border-[#e2e5e9] bg-[#f6f7f8] p-1.5">
            {filters.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={
                    "min-h-[42px] rounded-full px-4 text-[9px] font-bold transition " +
                    (active
                      ? "bg-[#111111] !text-white"
                      : "text-[#555e69] hover:bg-white")
                  }
                  style={active ? { color: "#fff" } : undefined}
                >
                  {item.label} · {item.count}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="mt-4 grid min-h-[220px] place-items-center rounded-[16px] bg-[#f5f5f5] text-[11px] font-semibold text-[#6d7580]">
            Loading offers…
          </div>
        ) : filtered.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => {
              const status = getProductOfferStatus(product);
              const offerPrice = getProductOfferPrice(product);
              const image =
                product.image ||
                product.colorVariants?.[0]?.images?.[0] ||
                product.colorVariants?.[0]?.image;

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[18px] border border-[#d9dde3] bg-white"
                >
                  <div className="grid grid-cols-[92px_minmax(0,1fr)]">
                    <div className="bg-[#f3f3f3]">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full min-h-[132px] w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 p-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={
                            "rounded-full px-2.5 py-1 text-[8px] font-bold capitalize " +
                            (status === "active"
                              ? "bg-[#111111] !text-white"
                              : status === "scheduled"
                                ? "bg-[#efefef] text-[#3d454f]"
                                : status === "expired"
                                  ? "bg-[#fff1f1] text-[#a33d3d]"
                                  : "bg-[#f1f2f3] text-[#777f89]")
                          }
                          style={status === "active" ? { color: "#fff" } : undefined}
                        >
                          {status}
                        </span>
                        {product.offerBadge ? (
                          <span className="rounded-full bg-[#f3f3f3] px-2.5 py-1 text-[8px] font-bold text-[#555d67]">
                            {product.offerBadge}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 truncate text-[12px] font-semibold">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-[8px] text-[#808791]">{product.sku}</p>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <span className="block text-[8px] text-[#7a828d]">
                            {offerValueText(product)}
                          </span>
                          <strong className="mt-0.5 block text-[14px]">
                            {status === "active" ? money(offerPrice) : money(product.price)}
                          </strong>
                        </div>
                        <Link
                          href={"/admin/products/" + product.id + "/edit#offer-settings"}
                          className="inline-flex min-h-[42px] items-center rounded-full bg-[#111111] px-4 text-[9px] font-bold !text-white"
                          style={{ color: "#fff" }}
                        >
                          {product.offerEnabled ? "Manage" : "Create"}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {product.offerEnabled ? (
                    <div className="grid grid-cols-2 gap-2 border-t border-[#eceef1] bg-[#fafafa] p-3 text-[8px] text-[#6e7681]">
                      <span>
                        Start<br />
                        <strong className="mt-0.5 block text-[#333940]">
                          {product.offerStartsAt
                            ? new Date(product.offerStartsAt).toLocaleDateString("en-IN")
                            : "Always"}
                        </strong>
                      </span>
                      <span>
                        End<br />
                        <strong className="mt-0.5 block text-[#333940]">
                          {product.offerEndsAt
                            ? new Date(product.offerEndsAt).toLocaleDateString("en-IN")
                            : "No expiry"}
                        </strong>
                      </span>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 grid min-h-[220px] place-items-center rounded-[16px] bg-[#f5f5f5] px-5 text-center">
            <div>
              <strong className="text-[13px] font-semibold">No offers found</strong>
              <p className="mt-2 text-[10px] text-[#68717b]">
                Change the filter or create an offer from a product.
              </p>
            </div>
          </div>
        )}

        {message ? (
          <p className="mt-4 text-[10px] font-semibold text-[#9a3d3d]">{message}</p>
        ) : null}
      </section>
    </div>
  );
}
