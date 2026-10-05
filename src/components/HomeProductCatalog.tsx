"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

export function HomeProductCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return activeProducts;

    return activeProducts.filter((product) =>
      [
        product.name,
        product.sku,
        product.category,
        ...product.colors,
        ...product.sizes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [activeProducts, query]);

  return (
    <section className="ref-shell ref-arrivals" aria-label="Product catalog">
      <div className="ref-arrivals-head">
        <div>
          <p className="ref-kicker">CATALOG</p>
          <h2>Products</h2>
        </div>

        <Link href="/products" className="ref-outline-pill">
          View all
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[440px]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, category, colour or size"
            aria-label="Search homepage products"
            className="h-[48px] w-full rounded-full border border-black/15 bg-white px-5 pr-12 text-[11px] font-medium text-[#111] outline-none transition placeholder:text-black/35 focus:border-black/35"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-[#f1f1f1] text-[12px] font-bold text-black/55"
              aria-label="Clear product search"
            >
              ×
            </button>
          ) : null}
        </div>

        <span className="text-[9px] font-semibold uppercase tracking-[.08em] text-black/40">
          {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
        </span>
      </div>

      {filteredProducts.length ? (
        <div className="ref-arrival-grid mt-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[16px] bg-[#f5f5f5] px-5 py-10 text-center">
          <strong className="text-[12px] font-semibold">No products found</strong>
          <p className="mt-1.5 text-[10px] text-black/45">
            Try another product name, category, colour or size.
          </p>
        </div>
      )}
    </section>
  );
}
