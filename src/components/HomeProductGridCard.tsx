import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getProductPrimaryImage } from "@/lib/product-images";
import type { Product } from "@/types/product";

export function HomeProductGridCard({ product }: { product: Product }) {
  const image = getProductPrimaryImage(product);

  return (
    <article className="min-w-0">
      <Link
        href={"/products/" + product.slug}
        className="group block"
        data-product-transition
        aria-label={"View " + product.name}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[10px] uppercase tracking-[.08em] text-black/30">
              No image
            </div>
          )}
        </div>

        <div className="pt-3">
          <h3 className="m-0 truncate text-[11px] font-semibold tracking-[-.01em] text-[#111] sm:text-[12px]">
            {product.name}
          </h3>

          <p className="mt-1 text-[10px] font-medium text-black/52 sm:text-[11px]">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
