import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-visual">
        <span>{product.category}</span>
        <strong>{product.name}</strong>
      </Link>

      <div className="product-meta">
        <div>
          <p>{product.name}</p>
          <small>{product.colors.join(" / ")}</small>
        </div>

        <div className="price-row">
          <span>{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <del>{formatPrice(product.compareAtPrice)}</del>
          ) : null}
        </div>
      </div>

      {product.status === "sold-out" ? (
        <span className="status-pill">Sold out</span>
      ) : null}
    </article>
  );
}
