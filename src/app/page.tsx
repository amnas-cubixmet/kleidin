import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { TopFashionHero } from "@/components/TopFashionHero";
import { ProductActions } from "@/components/ProductActions";
import { formatPrice } from "@/lib/format";
import { getCatalogProducts } from "@/lib/catalog";
export default async function Home() {
  const products = await getCatalogProducts();
  const tShirts = products.filter((product) => product.category === "T-Shirts");
  const featured = products.filter((product) => product.featured);
  const showcaseProducts = (tShirts.length ? tShirts : featured.length ? featured : products).slice(0, 3);
  const arrivals = products.slice(0, 4);
  const mostLoved = featured[0] ?? products[0];

  return (
    <div className="reference-home">
      {products.length ? (
        <>
          <TopFashionHero products={featured.length ? featured : products} />

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

    </div>
  );
}
