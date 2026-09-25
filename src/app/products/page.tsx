import type { Metadata } from "next";
import Image from "next/image";
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

  const title = category ?? (showNew ? "New Arrivals" : "Shop all");
  const eyebrow = category
    ? `Category / ${category}`
    : showNew
      ? "Latest Drop"
      : "Collection";

  const heroProduct =
    filteredProducts.find((product) => product.image) ??
    allProducts.find((product) => product.image);

  return (
    <section className="shop-page-premium">
      <div className="shop-hero-card">
        <div className="shop-hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>
            {filteredProducts.length
              ? `${filteredProducts.length} products available now.`
              : "No products available in this selection."}
          </p>
        </div>

        <div className="shop-hero-media">
          {heroProduct?.image ? (
            <Image
              src={heroProduct.image}
              alt={heroProduct.name}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 42vw"
            />
          ) : (
            <span>Collection</span>
          )}
        </div>
      </div>

      <div className="shop-content-shell">
        <div className="shop-filter-row">
          <a href="/products" className={!category && !showNew ? "active" : ""}>
            All
          </a>
          <a href="/products?new=1" className={showNew ? "active" : ""}>
            New
          </a>
          {categories.map((item) => (
            <a
              key={item}
              href={`/products?category=${encodeURIComponent(item)}`}
              className={category === item ? "active" : ""}
            >
              {item}
            </a>
          ))}
        </div>

        {filteredProducts.length ? (
          <div className="product-grid premium-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            <h2>Nothing here yet.</h2>
            <p>Add or enable products from the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
