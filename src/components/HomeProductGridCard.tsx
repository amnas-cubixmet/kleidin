"use client";

import { useOfferClock } from "@/hooks/useOfferClock";
import { getProductOfferPrice, isProductOfferActive } from "@/lib/product-offers";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, getProductWhatsappUrl } from "@/lib/format";
import type { Product } from "@/types/product";

export function HomeProductGridCard({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  const now = useOfferClock(product);
  const offerActive = isProductOfferActive(product, now);
  const price = getProductOfferPrice(product, now);
  const available = product.status === "active" && product.stock > 0;
  const whatsappHref = available ? getProductWhatsappUrl(product, whatsappNumber) : "#";
  const canOrder = available && !product.demo && whatsappHref !== "#";

  return (
    <article className="group relative min-w-0">
      <Link
        href={"/products/" + product.slug}
        className="absolute inset-0 z-10"
        data-product-transition
        aria-label={"View " + product.name}
      />

      <div className="kleid-product-image relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
        {product.demo ? <span className="absolute left-2 top-2 z-20 rounded-sm bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#111]">Demo preview</span> : null}
        <Image
          unoptimized={product.demo}
          src={product.image || "/images/product-1.png"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
      </div>

      <div className="kleid-product-info pt-3">
        <h3 className="kleid-product-name m-0 min-h-[2.5em] text-[11px] font-semibold tracking-[-.01em] text-[#111] sm:text-[12px]">
          {product.name}
        </h3>

        <p className="kleid-product-price mt-1 text-[10px] font-medium text-black/52 sm:text-[11px]">
          {formatPrice(price)}
          {offerActive ? <del className="ml-2 text-black/35">{formatPrice(product.price)}</del> : null}
        </p>

        <p className="kleid-product-meta">{product.category}</p>

        <a
          href={whatsappHref}
          target={whatsappHref === "#" ? undefined : "_blank"}
          rel={whatsappHref === "#" ? undefined : "noreferrer"}
          aria-disabled={whatsappHref === "#" ? "true" : undefined}
          onClick={(event) => { if (whatsappHref === "#") event.preventDefault(); }}
          className={
            "home-product-whatsapp-button relative z-20 mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-black px-3 text-[8px] font-semibold uppercase tracking-[.07em] !text-white transition sm:min-h-11 sm:text-[9px] " +
            (whatsappHref === "#"
              ? "cursor-default opacity-70"
              : "hover:opacity-90")
          }
          aria-label={canOrder ? "Order " + product.name + " on WhatsApp" : "Ordering unavailable for " + product.name}
        >
          {product.demo ? "Demo preview — not for sale" : canOrder ? "Order on WhatsApp ↗" : available ? "Contact unavailable" : "Sold out"}
        </a>
      </div>
    </article>
  );
}
