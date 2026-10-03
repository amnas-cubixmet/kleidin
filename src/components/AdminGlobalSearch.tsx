"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/data/products";
import {
  type AdminOrder,
  readAdminOrders,
  ADMIN_ORDERS_UPDATED_EVENT,
} from "@/lib/admin-orders";

type SearchResult = {
  key: string;
  label: string;
  meta: string;
  href: string;
  type: "Page" | "Order" | "Product";
};

const pages: SearchResult[] = [
  { key: "dashboard", label: "Dashboard", meta: "Overview and business metrics", href: "/admin/dashboard", type: "Page" },
  { key: "orders", label: "Orders", meta: "Manual orders and fulfilment", href: "/admin/orders", type: "Page" },
  { key: "products", label: "Products", meta: "Catalog and pricing", href: "/admin/products", type: "Page" },
  { key: "inventory", label: "Inventory", meta: "Stock and low-stock alerts", href: "/admin/inventory", type: "Page" },
  { key: "testimonials", label: "Testimonials", meta: "Review and approve feedback", href: "/admin/testimonials", type: "Page" },
  { key: "hero", label: "Hero", meta: "Storefront hero content", href: "/admin/hero", type: "Page" },
];

export function AdminGlobalSearch() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setOrders(readAdminOrders());
    sync();
    window.addEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        rootRef.current?.querySelector<HTMLInputElement>("input")?.focus();
        setOpen(true);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return pages.slice(0, 6);

    const pageResults = pages.filter((item) =>
      [item.label, item.meta].some((value) => value.toLowerCase().includes(term)),
    );

    const orderResults: SearchResult[] = orders
      .filter((order) =>
        [
          order.orderNumber,
          order.customerName,
          order.phone,
          order.city,
          order.pincode,
        ].some((value) => value.toLowerCase().includes(term)),
      )
      .slice(0, 6)
      .map((order) => ({
        key: order.id,
        label: order.orderNumber,
        meta: `${order.customerName} · ${order.phone}`,
        href: `/admin/orders/${order.id}`,
        type: "Order" as const,
      }));

    const productResults: SearchResult[] = products
      .filter((product) =>
        [product.name, product.sku, product.category].some((value) =>
          value.toLowerCase().includes(term),
        ),
      )
      .slice(0, 5)
      .map((product) => ({
        key: product.id,
        label: product.name,
        meta: `${product.sku} · ${product.category}`,
        href: "/admin/products",
        type: "Product" as const,
      }));

    return [...orderResults, ...pageResults, ...productResults].slice(0, 10);
  }, [orders, query]);

  return (
    <div ref={rootRef} className="relative w-full sm:w-[280px] xl:w-[320px]">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a828e]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          className="h-[44px] w-full rounded-full border border-[#d9dee7] bg-[#f7f8fb] pl-9 pr-12 text-[11px] font-medium text-[#22262d] outline-none placeholder:text-[#8f97a3] focus:border-[#001cac] focus:bg-white focus:ring-2 focus:ring-[#001cac]/10"
          placeholder="Search admin"
          aria-label="Search admin"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-[#d9dee7] bg-white px-1.5 py-0.5 text-[7px] font-bold text-[#8a919c] xl:block">
          Ctrl K
        </span>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[120] overflow-hidden rounded-[16px] border border-[#d9dee7] bg-white shadow-[0_18px_50px_rgba(16,24,40,.16)]">
          {results.length ? (
            <div className="max-h-[340px] overflow-y-auto p-1.5">
              {results.map((result) => (
                <Link
                  key={result.type + result.key}
                  href={result.href}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center justify-between gap-3 rounded-[11px] min-h-[52px] px-3 py-2.5 transition hover:bg-[#f4f6fb]"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-[11px] font-bold text-[#20242a]">
                      {result.label}
                    </strong>
                    <span className="mt-0.5 block truncate text-[9px] text-[#737c88]">
                      {result.meta}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eef2ff] px-2.5 py-1.5 text-[8px] font-bold text-[#001cac]">
                    {result.type}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <strong className="text-[11px] font-semibold text-[#454c56]">No results</strong>
              <p className="mt-1 text-[10px] text-[#8a919c]">Try another name, order number, phone or page.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
