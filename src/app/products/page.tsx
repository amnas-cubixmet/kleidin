import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; new?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const allProducts = await getCatalogProducts();

  const category = params.category;
  const showNew = params.new === "1";
  const query = params.q?.trim().toLowerCase();

  const categories = Array.from(
    new Set(allProducts.map((product) => product.category).filter(Boolean)),
  );

  const filteredProducts = allProducts.filter((product) => {
    if (category && product.category !== category) return false;
    if (showNew && !product.featured) return false;

    if (
      query &&
      ![product.name, product.category, ...product.colors]
        .join(" ")
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }

    return true;
  });

  const promoProduct =
    allProducts.find((product) => product.compareAtPrice && product.image) ??
    allProducts.find((product) => product.image) ??
    allProducts[0];

  return (
    <main className="catalog-reference-page">
      <section className="catalog-reference-hero">
        <p>Home / Men’s Collection</p>
        <h1>
          Discover the perfect style
          <br />
          for every occasion
        </h1>
      </section>

      <section className="catalog-toolbar-shell">
        <div className="catalog-toolbar">
          <form action="/products" method="get" className="catalog-search">
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            {showNew ? <input type="hidden" name="new" value="1" /> : null}
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search product..."
              aria-label="Search products"
            />
          </form>

          <div className="catalog-filter-scroll">
            <Link
              href="/products"
              className={!category && !showNew ? "active" : ""}
            >
              All
            </Link>
            <Link href="/products?new=1" className={showNew ? "active" : ""}>
              New
            </Link>
            {categories.map((item) => (
              <Link
                key={item}
                href={`/products?category=${encodeURIComponent(item)}`}
                className={category === item ? "active" : ""}
              >
                {item}
              </Link>
            ))}
            {(category || showNew || query) ? (
              <Link href="/products" className="catalog-clear-filter">
                Clear filter
              </Link>
            ) : null}
          </div>

          <div className="catalog-result-count">
            Results: {filteredProducts.length}
          </div>
        </div>
      </section>

      <section className="catalog-grid-shell">
        {filteredProducts.length ? (
          <div className="catalog-reference-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            <h2>Nothing here yet.</h2>
            <p>Try another category or search.</p>
          </div>
        )}
      </section>

      {promoProduct?.image ? (
        <section className="catalog-promo-wrap">
          <Link href={`/products/${promoProduct.slug}`} className="catalog-promo">
            <Image
              src={promoProduct.image}
              alt={promoProduct.name}
              fill
              sizes="100vw"
              className="catalog-promo-image"
            />
            <div className="catalog-promo-overlay" />
            <div className="catalog-promo-copy">
              <div>
                <p>LIMITED EDIT</p>
                <h2>
                  Start your style story.
                  <br />
                  Enjoy the current edit.
                </h2>
              </div>
              <span>Explore now →</span>
            </div>
          </Link>
        </section>
      ) : null}
    </main>
  );
}
