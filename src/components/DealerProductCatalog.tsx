"use client";

import { useMemo, useState } from "react";
import { WholesaleProductCard } from "@/components/WholesaleProductCard";
import type { Product } from "@/types/product";

export function DealerProductCatalog({
  products,
  whatsappNumber,
}: {
  products: Product[];
  whatsappNumber: string;
}) {
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(products.map((product) => product.category).filter(Boolean)),
      ),
    ],
    [products],
  );

  const visibleProducts = useMemo(
    () =>
      category === "All"
        ? products
        : products.filter((product) => product.category === category),
    [category, products],
  );

  return (
    <>
      <div className="dealer-filter-row">
        <label className="dealer-filter-field">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter dealer products by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <span className="dealer-filter-count">
          {visibleProducts.length} product{visibleProducts.length === 1 ? "" : "s"}
        </span>
      </div>

      <section
        className="dealer-product-grid dealer-product-grid-unified"
        aria-label="Dealer products"
      >
        {visibleProducts.map((product) => (
          <WholesaleProductCard
            key={product.id}
            product={product}
            whatsappNumber={whatsappNumber}
          />
        ))}
      </section>
    </>
  );
}
