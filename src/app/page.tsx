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
            <section className="ref-shell ref-ideas">
              <div className="ref-section-heading">
                <div>
                  <p className="ref-kicker">SHOP BY CATEGORY</p>
                  <h2>Explore the<br />collection.</h2>
                </div>
                <div className="ref-section-intro">
                  <p>Browse categories currently available in the KLEID.IN catalog.</p>
                  <Link href="/products" className="ref-outline-pill">
                    Explore shop <span>→</span>
                  </Link>
                </div>
              </div>

              <div className="ref-category-grid">
                {categories.map((category, index) => (
                  <Link href={category.href} className="ref-category-card" key={category.title}>
                    <span className="ref-category-index">0{index + 1}</span>
                    {category.image ? (
                      <div className="ref-category-thumb">
                        <Image
                          src={category.image}
                          alt={category.title}
                          fill
                          sizes="(max-width: 700px) 50vw, 25vw"
                          className="ref-category-image"
                        />
                      </div>
                    ) : null}
                    <div>
                      <h3>{category.title}</h3>
                      <p>{category.count} {category.count === 1 ? "product" : "products"}</p>
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
