import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { OfferHero } from "@/components/OfferHero";
import { getCatalogProducts } from "@/lib/catalog";
import { getActiveOffers } from "@/lib/site-settings";
import type { Product } from "@/types/product";

function getCategories(products: Product[]) {
  const grouped = new Map<string, Product[]>();

  for (const product of products) {
    const items = grouped.get(product.category) ?? [];
    items.push(product);
    grouped.set(product.category, items);
  }

  return Array.from(grouped.entries()).map(([title, items]) => ({
    title,
    count: items.length,
    image: items.find((item) => item.image)?.image,
    href: `/products?category=${encodeURIComponent(title)}`,
  }));
}

export default async function Home() {
  const [products, offers] = await Promise.all([
    getCatalogProducts(),
    getActiveOffers(),
  ]);

  const categories = getCategories(products).slice(0, 4);
  const featured = products.filter((product) => product.featured).slice(0, 3);
  const arrivals = products.slice(0, 4);

  return (
    <div className="reference-home">
      <OfferHero offers={offers} />

      {products.length ? (
        <>
          {categories.length ? (
            <section className="mx-auto w-[min(calc(100%-32px),1376px)] rounded-[26px] bg-kleid-cream px-5 py-14 sm:px-8 md:px-10 md:py-20 lg:px-12 lg:py-24">
              <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
                <div>
                  <p className="mb-5 text-[9px] font-semibold tracking-[0.18em] text-kleid-blue">
                    SHOP BY CATEGORY
                  </p>
                  <h2 className="m-0 max-w-[700px] text-[clamp(52px,7vw,96px)] font-semibold leading-[0.88] tracking-[-0.065em] text-kleid-ink">
                    Explore the
                    <br />
                    collection.
                  </h2>
                </div>

                <div className="flex max-w-[420px] flex-col gap-6 lg:justify-self-end">
                  <p className="m-0 text-[12px] leading-7 text-kleid-muted">
                    Browse categories currently available in the KLEID.IN catalog.
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex min-h-11 w-fit items-center gap-7 rounded-full border border-black/15 bg-white px-5 text-[10px] font-semibold transition hover:border-kleid-blue hover:text-kleid-blue"
                  >
                    Explore shop <span>→</span>
                  </Link>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-2.5 md:mt-16 md:gap-3 lg:grid-cols-4">
                {categories.map((category, index) => (
                  <Link
                    href={category.href}
                    key={category.title}
                    className="group relative aspect-[4/5] overflow-hidden rounded-[18px] bg-white"
                  >
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 25vw"
                        className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-[#ece9e3] text-[9px] uppercase tracking-[0.12em] text-kleid-muted">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                    <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1.5 text-[8px] font-semibold text-kleid-ink backdrop-blur md:left-4 md:top-4">
                      0{index + 1}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white md:p-5">
                      <div className="mb-1 flex items-end justify-between gap-3">
                        <h3 className="m-0 text-[18px] font-semibold tracking-[-0.035em] md:text-[22px]">
                          {category.title}
                        </h3>
                        <span className="text-[15px] transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                      <p className="m-0 text-[8px] text-white/70 md:text-[9px]">
                        {category.count} {category.count === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {featured.length ? (
            <section className="ref-shell ref-featured">
              <div className="ref-featured-copy">
                <p className="ref-kicker ref-kicker-light">FEATURED</p>
                <h2>Featured<br />products</h2>
                <p>Products selected as featured from the live catalog.</p>
                <Link href="/products" className="ref-outline-pill ref-outline-light">
                  View all products <span>→</span>
                </Link>
              </div>

              <div className="ref-featured-grid">
                {featured.map((product) => (
                  <Link href={`/products/${product.slug}`} className="ref-feature-card" key={product.id}>
                    <div className="ref-feature-image-wrap">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 800px) 100vw, 25vw"
                          className="ref-feature-image"
                        />
                      ) : null}
                    </div>
                    <div className="ref-feature-meta">
                      <span>{product.category}</span>
                      <strong>{product.name}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="ref-shell ref-arrivals">
            <div className="ref-arrivals-head">
              <div>
                <p className="ref-kicker">CATALOG</p>
                <h2>Available now.</h2>
              </div>
              <Link href="/products" className="ref-outline-pill">
                View all <span>→</span>
              </Link>
            </div>

            <div className="ref-arrival-grid">
              {arrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="ref-shell real-data-empty">
          <p className="ref-kicker">KLEID.IN</p>
          <h1>Collection coming soon.</h1>
          <p>Products will appear here after they are added from the admin panel.</p>
        </section>
      )}

      <section className="ref-brand-strip">
        <div className="ref-brand-strip-inner">
          <p>KLEID.IN</p>
          <h2>ONE WARDROBE.<br />NO LABELS.</h2>
          <Link href="/about" className="ref-pill ref-pill-light">
            About us <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
