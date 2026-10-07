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
  const whatsappHref = getProductWhatsappUrl(product, whatsappNumber);

  return (
    <article className="group relative min-w-0">
      <Link
        href={"/products/" + product.slug}
        className="absolute inset-0 z-10"
        data-product-transition
        aria-label={"View " + product.name}
      />

      <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
        <Image
          src={product.image || "/images/product-1.png"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
      </div>

      <div className="pt-3">
        <h3 className="m-0 truncate text-[11px] font-semibold tracking-[-.01em] text-[#111] sm:text-[12px]">
          {product.name}
        </h3>

        <p className="mt-1 text-[10px] font-medium text-black/52 sm:text-[11px]">
          {formatPrice(product.price)}
        </p>

        <a
          href={whatsappHref}
          target={whatsappHref === "#" ? undefined : "_blank"}
          rel={whatsappHref === "#" ? undefined : "noreferrer"}
          aria-disabled={whatsappHref === "#" ? "true" : undefined}
          className={
            "relative z-20 mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-full bg-[#001cac] px-3 text-[8px] font-semibold uppercase tracking-[.07em] text-white transition sm:min-h-10 sm:text-[9px] " +
            (whatsappHref === "#"
              ? "cursor-default opacity-70"
              : "hover:opacity-90")
          }
          aria-label={"Order " + product.name + " on WhatsApp"}
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}
