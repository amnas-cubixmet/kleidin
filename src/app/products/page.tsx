import type { Metadata } from "next";
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

  const filteredProducts = allProducts.filter((product) => {
    if (category && product.category !== category) return false;
    if (showNew && !product.featured) return false;
    if (
      query &&
      ![product.name, product.category, ...product.colors]
        .join(" ")
        .toLowerCase()
        .includes(query)
    ) return false;
    return true;
  });

  const title = category ?? (showNew ? "New Arrivals" : "Shop all");
  const eyebrow = category ? `Category / ${category}` : showNew ? "Latest Drop" : "Collection";

  return (
    <section className="section page-section shop-page">
      <div className="page-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{filteredProducts.length} products</p>
      </div>

      <div className="shop-filter-row">
        <a href="/products" className={!category && !showNew ? "active" : ""}>All</a>
        <a href="/products?new=1" className={showNew ? "active" : ""}>New</a>
        <a href="/products?category=T-Shirts" className={category === "T-Shirts" ? "active" : ""}>T-Shirts</a>
        <a href="/products?category=Shirts" className={category === "Shirts" ? "active" : ""}>Shirts</a>
        <a href="/products?category=Overshirts" className={category === "Overshirts" ? "active" : ""}>Overshirts</a>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
