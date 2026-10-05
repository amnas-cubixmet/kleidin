"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminDrawer } from "@/components/AdminDrawer";
import type { Product } from "@/types/product";
import type {
  InventoryMovement,
  InventoryStockAlert,
} from "@/types/admin";

type Summary = {
  totalProducts: number;
  totalUnits: number;
  lowStock: number;
  soldOut: number;
};

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function AdminInventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryStockAlert[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalProducts: 0,
    totalUnits: 0,
    lowStock: 0,
    soldOut: 0,
  });
  const [threshold, setThreshold] = useState(DEFAULT_LOW_STOCK_THRESHOLD);
  const [productId, setProductId] = useState("");
  const [delta, setDelta] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [reason, setReason] = useState("Manual adjustment");
  const [message, setMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load(nextThreshold = threshold) {
    const response = await fetch(
      "/api/admin/inventory?threshold=" + nextThreshold,
      { cache: "no-store" },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load inventory.");
    }

    setProducts(data.products || []);
    setMovements(data.movements || []);
    setSummary(data.summary || {});
    setAlerts(data.alerts || []);
    setThreshold(
      Number.isFinite(Number(data.lowStockThreshold))
        ? Number(data.lowStockThreshold)
        : nextThreshold,
    );

    if (!productId && data.products?.[0]?.id) {
      setProductId(data.products[0].id);
    }
  }

  useEffect(() => {
    void load(DEFAULT_LOW_STOCK_THRESHOLD).catch((error) =>
      setMessage(
        error instanceof Error ? error.message : "Could not load inventory.",
      ),
    );
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products],
  );

  const selectedColors = useMemo(() => {
    if (!selectedProduct) return [];

    const variantNames = (selectedProduct.colorVariants ?? [])
      .map((variant) => variant.name)
      .filter(Boolean);

    return Array.from(
      new Set([...variantNames, ...(selectedProduct.colors ?? [])]),
    );
  }, [selectedProduct]);

  const selectedSizes = useMemo(
    () => selectedProduct?.sizes ?? [],
    [selectedProduct],
  );

  const lowAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === "low"),
    [alerts],
  );

  const soldOutAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === "sold-out"),
    [alerts],
  );

  function openAdjustment(alert?: InventoryStockAlert) {
    setMessage("");

    if (alert) {
      setProductId(alert.productId);
      setColor(alert.color || "");
      setSize(alert.size || "");
      setDelta("");
      setReason(
        alert.status === "sold-out"
          ? "Sold out restock"
          : "Low stock restock",
      );
    } else {
      setColor("");
      setSize("");
      setDelta("");
      setReason("Manual adjustment");
    }

    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (busy) return;
    setDrawerOpen(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          delta: Number(delta),
          color,
          size,
          reason,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Stock update failed.");
      }

      setDelta("");
      setDrawerOpen(false);
      setMessage("Stock updated.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Stock update failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">
            STOCK CONTROL
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">
            Inventory
          </h1>
          <p className="mt-2 text-xs leading-5 text-black/45">
            Low stock alerts are calculated per product, colour and size.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAdjustment()}
          className="min-h-11 w-full rounded-xl bg-[#001cac] px-5 text-xs font-bold !text-white sm:w-auto"
        >
          Adjust stock
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="text-[10px] font-semibold uppercase tracking-[.08em] text-black/40">
            Products
          </p>
          <strong className="mt-2 block text-2xl">{summary.totalProducts}</strong>
        </article>

        <article className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="text-[10px] font-semibold uppercase tracking-[.08em] text-black/40">
            Stock units
          </p>
          <strong className="mt-2 block text-2xl">{summary.totalUnits}</strong>
        </article>

        <article
          className={
            "rounded-2xl p-4 ring-1 " +
            (lowAlerts.length
              ? "bg-amber-50 ring-amber-200"
              : "bg-white ring-black/5")
          }
        >
          <p
            className={
              "text-[10px] font-semibold uppercase tracking-[.08em] " +
              (lowAlerts.length ? "text-amber-700" : "text-black/40")
            }
          >
            Low stock alerts
          </p>
          <strong
            className={
              "mt-2 block text-2xl " +
              (lowAlerts.length ? "text-amber-800" : "")
            }
          >
            {lowAlerts.length}
          </strong>
        </article>

        <article
          className={
            "rounded-2xl p-4 ring-1 " +
            (soldOutAlerts.length
              ? "bg-red-50 ring-red-200"
              : "bg-white ring-black/5")
          }
        >
          <p
            className={
              "text-[10px] font-semibold uppercase tracking-[.08em] " +
              (soldOutAlerts.length ? "text-red-700" : "text-black/40")
            }
          >
            Sold out alerts
          </p>
          <strong
            className={
              "mt-2 block text-2xl " +
              (soldOutAlerts.length ? "text-red-700" : "")
            }
          >
            {soldOutAlerts.length}
          </strong>
        </article>
      </div>

      {alerts.length ? (
        <section className="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
          <div className="flex flex-col gap-3 border-b border-black/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                </span>
                <h2 className="text-sm font-bold">Low stock alerts</h2>
              </div>
              <p className="mt-1 text-[10px] text-black/45">
                Alert when a product, colour or size has {threshold} units or less.
              </p>
            </div>

            <span className="w-fit rounded-full bg-black/[.04] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.08em] text-black/50">
              {alerts.length} need attention
            </span>
          </div>

          <div className="grid gap-2 p-3 md:hidden">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className={
                  "rounded-2xl border p-3 " +
                  (alert.status === "sold-out"
                    ? "border-red-200 bg-red-50/60"
                    : "border-amber-200 bg-amber-50/60")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={"/admin/products/" + alert.productId}
                      className="block truncate text-sm font-bold"
                    >
                      {alert.productName}
                    </Link>
                    <p className="mt-1 text-[10px] text-black/45">
                      {alert.sku}
                      {[alert.color, alert.size].filter(Boolean).length
                        ? " · " +
                          [alert.color, alert.size].filter(Boolean).join(" / ")
                        : " · Base stock"}
                    </p>
                  </div>

                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase " +
                      (alert.status === "sold-out"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800")
                    }
                  >
                    {alert.status === "sold-out"
                      ? "Sold out"
                      : alert.stock + " left"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openAdjustment(alert)}
                  className="mt-3 min-h-11 w-full rounded-xl bg-[#111] px-4 text-xs font-bold !text-white"
                >
                  Restock
                </button>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="bg-black/[.015] text-black/40">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th>Variant</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="border-t border-black/5">
                    <td className="px-5 py-3">
                      <Link
                        href={"/admin/products/" + alert.productId}
                        className="font-semibold hover:text-[#001cac]"
                      >
                        {alert.productName}
                      </Link>
                      <span className="mt-0.5 block text-[9px] text-black/40">
                        {alert.sku}
                      </span>
                    </td>
                    <td>
                      {[alert.color, alert.size].filter(Boolean).join(" / ") ||
                        "Base stock"}
                    </td>
                    <td>
                      <strong>{alert.stock}</strong>
                    </td>
                    <td>
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase " +
                          (alert.status === "sold-out"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800")
                        }
                      >
                        {alert.status === "sold-out" ? "Sold out" : "Low stock"}
                      </span>
                    </td>
                    <td className="pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => openAdjustment(alert)}
                        className="min-h-9 rounded-lg border border-black/10 px-3 text-[10px] font-bold"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-bold text-emerald-800">Stock looks healthy</p>
          <p className="mt-1 text-[10px] leading-5 text-emerald-700/70">
            No product, colour or size is at or below {threshold} units.
          </p>
        </section>
      )}

      {message ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-xs font-medium text-black/60 ring-1 ring-black/5">
          {message}
        </p>
      ) : null}

      <AdminDrawer
        open={drawerOpen}
        title="Adjust stock"
        description="Increase or decrease stock for a product, colour or exact size."
        onClose={closeDrawer}
      >
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:grid-cols-2"
        >
          <label className="md:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/45">
              Product
            </span>
            <select
              value={productId}
              onChange={(event) => {
                setProductId(event.target.value);
                setColor("");
                setSize("");
              }}
              required
              className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            >
              <option value="">Choose product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.stock}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/45">
              Colour
            </span>
            <select
              value={color}
              onChange={(event) => setColor(event.target.value)}
              disabled={!selectedColors.length}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 px-3 text-sm disabled:bg-black/[.03] disabled:text-black/35"
            >
              <option value="">
                {selectedColors.length ? "Base / no colour" : "No colour variants"}
              </option>
              {selectedColors.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/45">
              Size
            </span>
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
              disabled={!selectedSizes.length || !color}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 px-3 text-sm disabled:bg-black/[.03] disabled:text-black/35"
            >
              <option value="">
                {selectedSizes.length ? "Colour total / no size" : "No sizes"}
              </option>
              {selectedSizes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/45">
              Stock change
            </span>
            <input
              type="number"
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
              placeholder="+10 or -2"
              required
              className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
          </label>

          <label>
            <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/45">
              Reason
            </span>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
          </label>

          <button
            disabled={busy}
            className="min-h-11 rounded-xl bg-[#001cac] px-4 py-2.5 text-xs font-bold !text-white disabled:opacity-50 md:col-span-2"
          >
            {busy ? "Updating…" : "Update stock"}
          </button>

          {message ? (
            <p className="text-xs font-medium text-black/55 md:col-span-2">
              {message}
            </p>
          ) : null}
        </form>
      </AdminDrawer>

      <section className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Recent stock movements</h2>
            <p className="mt-1 text-[10px] text-black/40">
              Latest manual and order-related inventory changes.
            </p>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-black/40">
              <tr>
                <th className="py-3">Product</th>
                <th>Variant</th>
                <th>Change</th>
                <th>Reason</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-t border-black/5">
                  <td className="py-3 font-semibold">{movement.productName}</td>
                  <td>
                    {[movement.color, movement.size]
                      .filter(Boolean)
                      .join(" / ") || "Base stock"}
                  </td>
                  <td
                    className={
                      movement.delta >= 0
                        ? "font-bold text-emerald-700"
                        : "font-bold text-red-600"
                    }
                  >
                    {movement.delta > 0 ? "+" : ""}
                    {movement.delta}
                  </td>
                  <td>{movement.reason}</td>
                  <td>{movement.reference || "—"}</td>
                  <td>
                    {new Date(movement.createdAt).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}

              {!movements.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-xs text-black/40"
                  >
                    No stock movements yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
