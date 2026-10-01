import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { TopFashionHero } from "@/components/TopFashionHero";
import { ProductActions } from "@/components/ProductActions";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { formatPrice, getWhatsappUrl } from "@/lib/format";
import { getCatalogProducts } from "@/lib/catalog";
import { getActiveOffers, getStoreSettings } from "@/lib/site-settings";
export default async function Home() {
  const [products, settings, offers] = await Promise.all([
    getCatalogProducts(),
    getStoreSettings(),
    getActiveOffers(),
  ]);

  const contactHref = settings.whatsappNumber
    ? getWhatsappUrl(undefined, settings.whatsappNumber)
    : settings.supportEmail
      ? `mailto:${settings.supportEmail}`
      : "/contact";
  const tShirts = products.filter((product) => product.category === "T-Shirts");
  const featured = products.filter((product) => product.featured);
  const showcaseProducts = (tShirts.length ? tShirts : featured.length ? featured : products).slice(0, 3);
  const arrivals = products.slice(0, 4);
  const mostLoved = featured[0] ?? products[0];

  return (
    <div className="reference-home">
      {products.length ? (
        <>
          <TopFashionHero
            products={products}
            contactHref={contactHref}
            offer={offers[0] ?? null}
          />

          {showcaseProducts.length ? (
            <AutoOutfitHero products={showcaseProducts} />
          ) : null}

          <section className="ref-shell ref-arrivals">
            <div className="ref-arrivals-head">
              <div>
                <p className="ref-kicker">CATALOG</p>
                <h2>Available now.</h2>
              </div>
              <Link href="/products" className="ref-outline-pill">
                View all
              </Link>
            </div>

            <div className="ref-arrival-grid">
              {arrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section className="ref-brand-strip">
            <div className="ref-brand-strip-inner">
              <p>KLEID.IN</p>
              <h2>ONE WARDROBE.<br />NO LABELS.</h2>
              <Link href="/about" className="ref-pill ref-pill-light">
                About us
              </Link>
            </div>
          </section>

          <section className="mx-auto w-[min(calc(100%_-_24px),1376px)] py-3 md:py-5">
            <div className="grid overflow-hidden rounded-[24px] bg-[#F4F0E9] md:grid-cols-[1.1fr_.9fr]">
              <div className="p-6 md:p-8">
                <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
                  WHOLESALE / DEALERS
                </p>
                <h2 className="mt-5 max-w-[760px] text-[clamp(42px,6vw,88px)] font-semibold leading-[.86] tracking-[-.06em]">
                  Stock KLEID.IN.
                </h2>
                <p className="mt-5 max-w-[560px] text-[11px] leading-5 text-black/55">
                  Wholesale enquiries for retailers, resellers and independent
                  stores. Ask for current availability, dealer pricing and order
                  requirements.
                </p>
                <Link
                  href="/wholesale"
                  className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#111] px-5 text-[9px] font-semibold !text-white"
                >
                  Explore wholesale
                </Link>
              </div>

              <div className="grid border-t border-black/10 md:border-l md:border-t-0">
                {[
                  ["01", "Retailers"],
                  ["02", "Resellers"],
                  ["03", "Repeat orders"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="flex min-h-[96px] items-center justify-between border-b border-black/10 px-5 last:border-b-0"
                  >
                    <span className="text-[8px] text-black/35">{number}</span>
                    <strong className="text-[18px] font-semibold tracking-[-.035em]">
                      {label}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {mostLoved ? (
            <section className="home-spotlight">
              <div className="home-spotlight-grid">
                <Link
                  href={`/products/${mostLoved.slug}`}
                  className="home-spotlight-media"
                  aria-label={`View ${mostLoved.name}`}
                >
                  {mostLoved.image ? (
                    <Image
                      src={mostLoved.image}
                      alt={mostLoved.name}
                      fill
                      sizes="(max-width: 900px) 100vw, 58vw"
                      className="home-spotlight-image"
                    />
                  ) : (
                    <span>No image</span>
                  )}

                  <div className="home-spotlight-media-badge">
                    <span>01</span>
                    <strong>Most loved</strong>
                  </div>
                </Link>

                <div className="home-spotlight-info">
                  <div className="home-spotlight-info-inner">
                    <div className="home-spotlight-topline">
                      <span>{mostLoved.stock > 0 ? "In stock" : "Sold out"}</span>
                    </div>

                    <div>
                      <h2>{mostLoved.name}</h2>

                      <div className="home-spotlight-price">
                        <strong>{formatPrice(mostLoved.price)}</strong>
                        {mostLoved.compareAtPrice ? (
                          <del>{formatPrice(mostLoved.compareAtPrice)}</del>
                        ) : null}
                      </div>
                    </div>

                    <p className="home-spotlight-description">
                      {mostLoved.description}
                    </p>

                    <div className="home-spotlight-meta">
                      <div>
                        <span>Colour</span>
                        <strong>{mostLoved.colors.join(" / ")}</strong>
                      </div>
                      <div>
                        <span>Sizes</span>
                        <strong>{mostLoved.sizes.join(" · ")}</strong>
                      </div>
                    </div>

                    <ProductActions product={mostLoved} compact />

                    <Link
                      href={`/products/${mostLoved.slug}`}
                      className="home-spotlight-view"
                    >
                      View full product <span>↗</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <TestimonialsSection
            eyebrow="CUSTOMER STORIES"
            title="Worn. Lived in. Repeated."
          />
        </>
      ) : null}

    </div>
  );
}
