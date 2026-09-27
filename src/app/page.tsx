import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { getCatalogProducts } from "@/lib/catalog";
export default async function Home() {
  const products = await getCatalogProducts();
  const tShirts = products.filter((product) => product.category === "T-Shirts");
  const featured = products.filter((product) => product.featured);
  const showcaseProducts = (tShirts.length ? tShirts : featured.length ? featured : products).slice(0, 3);
  const arrivals = products.slice(0, 4);

  return (
    <div className="reference-home">
      {products.length ? (
        <>
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
    </div>
  );
}
