import Link from "next/link";
import type { Product } from "@/types/product";
import { HomeProductGridCard } from "@/components/HomeProductGridCard";
import { homeDemoProducts } from "@/lib/home-demo-products";

export function HomeAllProductsSection({
  whatsappNumber,
  products = [],
  demo = true,
  title = "ALL PRODUCTS",
  eyebrow = "",
}: {
  whatsappNumber: string;
  products?: Product[];
  demo?: boolean;
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section
      id="all-products"
      className="scroll-mt-20 bg-white px-3 py-14 text-[#111] sm:px-5 sm:py-18 lg:px-6 lg:py-20"
      aria-label="All products"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="kleid-catalog-heading">
          <div>
            {eyebrow ? <p className="kleid-edit-kicker">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <div className="kleid-catalog-heading-right">
            <p className="kleid-catalog-note">
              Discover the pieces you'll keep reaching for.
              Simple to wear, easy to make your own.
            </p>
            <Link href="/products" className="kleid-catalog-all">
              View full collection <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {!products.length && !demo ? <p className="mt-8 text-sm text-black/50">The collection is coming soon.</p> : null}
        <div className="kleid-catalog-grid mt-8 grid grid-cols-2 gap-x-2.5 gap-y-7 sm:gap-x-3.5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-11">
          {(products.length ? products : demo ? homeDemoProducts : []).map((product) => (
            <HomeProductGridCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
