import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-visual">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 980px) 50vw, 25vw"
            className="product-image"
          />
        ) : null}

        <span className="product-tag">
          {product.featured ? "New" : product.category}
        </span>
      </Link>

      <div className="product-card-info">
        <div className="product-card-topline">
          <Link href={`/products/${product.slug}`} className="product-name">
            {product.name}
          </Link>
          <span>{formatPrice(product.price)}</span>
        </div>

        <div className="product-card-bottomline">
          <span>{product.colors.join(" / ")}</span>
          <span>{product.sizes.join(" · ")}</span>
        </div>

        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
