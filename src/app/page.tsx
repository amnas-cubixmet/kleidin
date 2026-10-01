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
                <h2></h2>
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

          <section className="home-dealers-clean">
            <div>
              <p>DEALERS</p>
              <h2>Stock KLEID.IN.</h2>
              <span>
                For retailers, resellers and independent stores. Ask for current
                availability, minimum quantities and dealer ordering.
              </span>
              <Link href="/wholesale">Explore dealers</Link>
            </div>
            <div className="home-dealers-copy">
              <strong>Retailers</strong>
              <strong>Resellers</strong>
              <strong>Repeat orders</strong>
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
