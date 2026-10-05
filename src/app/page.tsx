import Image from "next/image";
import Link from "next/link";
import { HomeProductCatalog } from "@/components/HomeProductCatalog";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { TopFashionHero } from "@/components/TopFashionHero";
import { ProductActions } from "@/components/ProductActions";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { formatPrice } from "@/lib/format";
import { getCatalogProducts } from "@/lib/catalog";
import { listHeroSlides } from "@/lib/mongodb-hero";
import { getStoreSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export default async function Home() {
  const [products, heroSlides, settings] = await Promise.all([
    getCatalogProducts(),
    listHeroSlides({ enabledOnly: true }).catch(() => []),
    getStoreSettings(),
  ]);
  const featured = products
    .filter(
      (product) => product.featured && product.status === "active",
    )
    .sort(
      (a, b) =>
        (a.featuredSortOrder ?? a.sortOrder ?? 100) -
        (b.featuredSortOrder ?? b.sortOrder ?? 100),
    );
  const showcaseProducts = featured
    .filter((product) => product.featuredAnimationEnabled)
    .slice(0, 4);
  const mostLoved = featured.find((product) => product.stock > 0) ?? featured[0];

  return (
    <div className="reference-home">
      <TopFashionHero products={products} heroSlides={heroSlides} />

      {products.length ? (
        <>
          {showcaseProducts.length ? (
            <AutoOutfitHero products={showcaseProducts} />
          ) : null}

          <HomeProductCatalog products={products} />

          <section className="ref-brand-strip">
            <div className="ref-brand-strip-inner">
              <p>{settings.homeBrandEyebrow}</p>
              <h2>
                {settings.homeBrandTitle.split("\n").map((line, index) => (
                  <span key={line + index}>
                    {line}
                    {index < settings.homeBrandTitle.split("\n").length - 1 ? <br /> : null}
                  </span>
                ))}
              </h2>
              <Link href="/about" className="ref-pill ref-pill-light">
                About us
              </Link>
            </div>
          </section>

          <section className="home-dealers-clean">
            <div>
              <p>{settings.homeDealersEyebrow}</p>
              <h2>{settings.homeDealersTitle}</h2>
              <span>{settings.homeDealersBody}</span>
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
      ) : (
        <>
          <section className="ref-brand-strip">
            <div className="ref-brand-strip-inner">
              <p>{settings.homeBrandEyebrow}</p>
              <h2>
                {settings.homeBrandTitle.split("\n").map((line, index) => (
                  <span key={line + index}>
                    {line}
                    {index < settings.homeBrandTitle.split("\n").length - 1 ? <br /> : null}
                  </span>
                ))}
              </h2>
              <Link href="/about" className="ref-pill ref-pill-light">
                About us
              </Link>
            </div>
          </section>

          <section className="home-dealers-clean">
            <div>
              <p>{settings.homeDealersEyebrow}</p>
              <h2>{settings.homeDealersTitle}</h2>
              <span>{settings.homeDealersBody}</span>
              <Link href="/contact">Contact KLEID.IN</Link>
            </div>
            <div className="home-dealers-copy">
              <strong>Retailers</strong>
              <strong>Resellers</strong>
              <strong>Repeat orders</strong>
            </div>
          </section>

          <TestimonialsSection
            eyebrow="CUSTOMER STORIES"
            title="Worn. Lived in. Repeated."
          />
        </>
      )}

    </div>
  );
}
