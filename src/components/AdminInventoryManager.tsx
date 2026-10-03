"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

type Filter = "all" | "low" | "critical" | "out";

function stockState(stock: number) {
  if (stock <= 0) return { label: "Out of stock", tone: "bg-[#111111] text-white" };
  if (stock <= 5) return { label: "Critical", tone: "bg-[#fff0f0] text-[#b42318]" };
  if (stock <= 10) return { label: "Low", tone: "bg-[#fff7e8] text-[#9a6700]" };
  return { label: "Healthy", tone: "bg-[#eef1f3] text-[#414852]" };
}

export function AdminInventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState<Record<string, {
    stock: number;
    colors: Record<string, number>;
  }>>({});

  async function load() {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load inventory.");

      const nextProducts = (data.products ?? []) as Product[];
      setProducts(nextProducts);
      setConfigured(data.configured !== false);
      setDrafts(
        Object.fromEntries(
          nextProducts.map((product) => [
            product.id,
            {
              stock: product.stock,
              colors: Object.fromEntries(
                (product.colorVariants ?? []).map((variant) => [
                  variant.name,
                  variant.stock ?? 0,
                ]),
              ),
            },
          ]),
        ),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
    const low = products.filter((product) => product.stock > 5 && product.stock <= 10).length;
    const critical = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
    const out = products.filter((product) => product.stock <= 0).length;
    return { totalUnits, low, critical, out };
  }, [products]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return [...products]
      .sort((a, b) => a.stock - b.stock)
      .filter((product) => {
        if (filter === "low" && !(product.stock > 5 && product.stock <= 10)) return false;
        if (filter === "critical" && !(product.stock > 0 && product.stock <= 5)) return false;
        if (filter === "out" && product.stock > 0) return false;

        if (!term) return true;
        return [product.name, product.sku, product.category]
          .some((value) => value.toLowerCase().includes(term));
      });
  }, [filter, products, query]);

  function setProductStock(productId: string, value: number) {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] ?? { colors: {} }),
        stock: Math.max(0, Math.floor(value || 0)),
      },
    }));
  }

  function setColorStock(productId: string, color: string, value: number) {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] ?? { stock: 0, colors: {} }),
        colors: {
          ...(current[productId]?.colors ?? {}),
          [color]: Math.max(0, Math.floor(value || 0)),
        },
      },
    }));
  }

  async function save(product: Product) {
    const draft = drafts[product.id];
    if (!draft) return;

    try {
      setSavingId(product.id);
      setMessage("");

      const response = await fetch("/api/admin/inventory/" + product.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: draft.stock,
          colorStocks: draft.colors,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update stock.");

      const updated = data.product as Product;
      setProducts((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setDrafts((current) => ({
        ...current,
        [updated.id]: {
          stock: updated.stock,
          colors: Object.fromEntries(
            (updated.colorVariants ?? []).map((variant) => [
              variant.name,
              variant.stock ?? 0,
            ]),
          ),
        },
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update stock.");
    } finally {
      setSavingId("");
    }
  }

  const filterButtons: { key: Filter; label: string }[] = [
    { key: "all", label: "All stock" },
    { key: "low", label: "Low" },
    { key: "critical", label: "Critical" },
    { key: "out", label: "Out of stock" },
  ];

  return (
    <div className="grid gap-4">
      {!configured ? (
        <div className="rounded-[16px] border border-[#ead3a6] bg-[#fffaf0] p-4 text-[10px] leading-5 text-[#745d2c]">
          <strong className="block text-[11px]">Supabase inventory is not connected yet.</strong>
          Configure the product database first. Inventory will use the same product records and storage setup.
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Total units", stats.totalUnits],
          ["Low stock", stats.low],
          ["Critical", stats.critical],
          ["Out of stock", stats.out],
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
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Stock control
            </p>
            <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em] sm:text-[30px]">
              Inventory
            </h2>
            <p className="mt-1.5 text-[10px] leading-5 text-[#626a75] sm:text-[11px]">
              Update total stock or colour-level stock. Saving colour stock automatically recalculates total stock.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-[46px] w-full rounded-[12px] border border-[#d6dae0] bg-[#f6f6f6] px-4 text-[11px] font-medium outline-none placeholder:text-[#8e959f] focus:border-[#111111] focus:bg-white focus:ring-2 focus:ring-black/10 sm:w-[300px]"
              placeholder="Search product / SKU"
            />
            <button
              type="button"
              onClick={() => void load()}
              className="min-h-[46px] rounded-full border border-[#d5d9df] bg-white px-5 text-[10px] font-bold text-[#4d5560]"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] border border-[#e2e5e9] bg-[#f6f7f8] p-1.5 sm:inline-flex sm:rounded-full">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:gap-1">
            {filterButtons.map((item) => {
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
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="mt-4 flex min-h-[150px] items-center justify-center rounded-[16px] border border-[#e5e7ea] bg-white px-5 text-center sm:min-h-[180px]">
            <div>
              <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-[#d5d9df] border-t-[#111111]" />
              <strong className="mt-3 block text-[11px] font-semibold text-[#4f5761]">
                Loading inventory
              </strong>
              <span className="mt-1 block text-[9px] text-[#8a919b]">
                Fetching current stock levels…
              </span>
            </div>
          </div>
        ) : filtered.length ? (
          <div className="mt-5 grid gap-3">
            {filtered.map((product) => {
              const draft = drafts[product.id] ?? { stock: product.stock, colors: {} };
              const state = stockState(product.stock);
              const hasVariants = Boolean(product.colorVariants?.length);

              return (
                <article
                  key={product.id}
                  className="rounded-[18px] border border-[#d9dde3] bg-white p-4 sm:rounded-[20px] sm:p-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="truncate text-[13px] font-semibold text-[#17191d]">
                          {product.name}
                        </strong>
                        <span className={"rounded-full px-2.5 py-1.5 text-[8px] font-bold " + state.tone}>
                          {state.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[9px] text-[#747c86]">
                        {product.sku} · {product.category}
                      </p>
                      <Link
                        href={"/admin/products/" + product.id}
                        className="mt-2 inline-flex min-h-[40px] items-center text-[9px] font-bold text-[#30363d]"
                      >
                        View product →
                      </Link>
                    </div>

                    {!hasVariants ? (
                      <label>
                        <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] text-[#6e7681]">
                          Total stock
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setProductStock(product.id, draft.stock - 1)}
                            className="h-[44px] w-[44px] rounded-full border border-[#d5d9df] bg-white text-[18px] font-medium"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={draft.stock}
                            onChange={(event) =>
                              setProductStock(product.id, Number(event.target.value))
                            }
                            className="h-[46px] min-w-0 flex-1 rounded-[11px] border border-[#d5d9df] bg-[#f7f7f7] px-3 text-center text-[12px] font-semibold outline-none focus:border-[#111111]"
                          />
                          <button
                            type="button"
                            onClick={() => setProductStock(product.id, draft.stock + 1)}
                            className="h-[44px] w-[44px] rounded-full border border-[#d5d9df] bg-white text-[18px] font-medium"
                          >
                            +
                          </button>
                        </div>
                      </label>
                    ) : (
                      <div className="rounded-[14px] bg-[#f5f5f5] px-3.5 py-3">
                        <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#747c86]">
                          Current total
                        </span>
                        <strong className="mt-1 block text-[19px] font-semibold">
                          {product.stock}
                        </strong>
                        <span className="mt-1 block text-[8px] text-[#858c96]">
                          Calculated from colours
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void save(product)}
                      disabled={savingId === product.id}
                      className="min-h-[46px] rounded-full bg-[#111111] px-6 text-[10px] font-bold text-white disabled:opacity-50"
                    >
                      {savingId === product.id ? "Saving…" : "Save stock"}
                    </button>
                  </div>

                  {hasVariants ? (
                    <div className="mt-4 grid gap-2 border-t border-[#eceef1] pt-4 sm:grid-cols-2 xl:grid-cols-4">
                      {product.colorVariants?.map((variant) => (
                        <div
                          key={variant.name}
                          className="rounded-[14px] bg-[#f7f7f7] p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-6 w-6 rounded-full border border-black/10"
                              style={{ backgroundColor: variant.value || "#111111" }}
                            />
                            <strong className="text-[10px] font-semibold">
                              {variant.name}
                            </strong>
                          </div>
                          <div className="mt-3 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setColorStock(
                                  product.id,
                                  variant.name,
                                  (draft.colors[variant.name] ?? 0) - 1,
                                )
                              }
                              className="h-[40px] w-[40px] rounded-full border border-[#d5d9df] bg-white text-[16px]"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={draft.colors[variant.name] ?? 0}
                              onChange={(event) =>
                                setColorStock(
                                  product.id,
                                  variant.name,
                                  Number(event.target.value),
                                )
                              }
                              className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#d5d9df] bg-white px-2 text-center text-[11px] font-semibold outline-none focus:border-[#111111]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setColorStock(
                                  product.id,
                                  variant.name,
                                  (draft.colors[variant.name] ?? 0) + 1,
                                )
                              }
                              className="h-[40px] w-[40px] rounded-full border border-[#d5d9df] bg-white text-[16px]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 grid min-h-[240px] place-items-center rounded-[16px] bg-[#f5f5f5] px-5 text-center">
            <div>
              <strong className="text-[13px] font-semibold">No inventory found</strong>
              <p className="mt-2 text-[10px] leading-5 text-[#68717b]">
                Try another search or stock filter.
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
