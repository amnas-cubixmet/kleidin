import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getActiveProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ProductsPage() {
  const products = getActiveProducts();

  return (
    <section className="section page-section">
      <div className="page-title">
        <p className="eyebrow">Collection 01</p>
        <h1>Shop all</h1>
        <p>{products.length} products</p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
