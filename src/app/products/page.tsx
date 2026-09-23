import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getActiveProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop",
};

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    new?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const allProducts = getActiveProducts();

  const category = params.category;
  const showNew = params.new === "1";

  const filteredProducts = allProducts.filter((product) => {
    if (category && product.category !== category) return false;
    if (showNew && !product.featured) return false;
    return true;
  });

  const title = category ?? (showNew ? "New Arrivals" : "Shop all");
  const eyebrow = category
    ? `Category / ${category}`
    : showNew
      ? "Latest Drop"
      : "Collection 01";

  return (
    <section className="section page-section">
      <div className="page-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{filteredProducts.length} products</p>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
