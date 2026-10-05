"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Product } from "@/types/product";
import type { InventoryMovement } from "@/types/admin";

type Summary = {
  totalProducts: number;
  totalUnits: number;
  lowStock: number;
  soldOut: number;
};

export function AdminInventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalProducts: 0, totalUnits: 0, lowStock: 0, soldOut: 0 });
  const [productId, setProductId] = useState("");
  const [delta, setDelta] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [reason, setReason] = useState("Manual adjustment");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/inventory", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load inventory.");
    setProducts(data.products || []);
    setMovements(data.movements || []);
    setSummary(data.summary || {});
    if (!productId && data.products?.[0]?.id) setProductId(data.products[0].id);
  }

  useEffect(() => {
    void load().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load inventory."));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, delta: Number(delta), color, size, reason }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Stock update failed.");
      return;
    }
    setDelta("");
    setMessage("Stock updated.");
    await load();
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">STOCK CONTROL</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">Inventory</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Products", summary.totalProducts], ["Stock units", summary.totalUnits], ["Low stock", summary.lowStock], ["Sold out", summary.soldOut]].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <p className="text-[10px] font-semibold uppercase tracking-[.08em] text-black/40">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:grid-cols-2 lg:grid-cols-6">
        <select value={productId} onChange={(event) => setProductId(event.target.value)} required className="rounded-xl border border-black/10 px-3 py-2.5 text-sm lg:col-span-2">
          <option value="">Choose product</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name} — {product.stock}</option>)}
        </select>
        <input value={color} onChange={(event) => setColor(event.target.value)} placeholder="Colour (optional)" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
        <input value={size} onChange={(event) => setSize(event.target.value)} placeholder="Size (optional)" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
        <input type="number" value={delta} onChange={(event) => setDelta(event.target.value)} placeholder="+10 or -2" required className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
        <button className="rounded-xl bg-[#001cac] px-4 py-2.5 text-xs font-bold text-white">Update stock</button>
        <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm md:col-span-2 lg:col-span-6" />
        {message ? <p className="text-xs font-medium text-black/55 lg:col-span-6">{message}</p> : null}
      </form>

      <section className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-black/5">
        <h2 className="font-bold">Recent stock movements</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-black/40"><tr><th className="py-3">Product</th><th>Variant</th><th>Change</th><th>Reason</th><th>Reference</th><th>Date</th></tr></thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-t border-black/5">
                  <td className="py-3 font-semibold">{movement.productName}</td>
                  <td>{[movement.color, movement.size].filter(Boolean).join(" / ") || "Base stock"}</td>
                  <td className={movement.delta >= 0 ? "font-bold text-emerald-700" : "font-bold text-red-600"}>{movement.delta > 0 ? "+" : ""}{movement.delta}</td>
                  <td>{movement.reason}</td>
                  <td>{movement.reference || "—"}</td>
                  <td>{new Date(movement.createdAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
