"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

type Props = {
  product: Product;
  label?: string;
  className?: string;
};

export function AddToCartButton({
  product,
  label = "Quick add",
  className = "",
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const disabled = product.status !== "active" || product.stock <= 0;

  function handleAdd() {
    if (disabled) return;

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0] ?? "One size",
      color: product.colors[0] ?? "Default",
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      className={`quick-add ${className}`}
      onClick={handleAdd}
      disabled={disabled}
    >
      {disabled ? "Sold out" : added ? "Added" : label}
    </button>
  );
}
