import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/data/products";

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">KLEID.IN / 01</p>
        <h1>Everyday clothing, stripped back to what matters.</h1>
        <div className="hero-bottom">
          <p>
            Modern T-shirts with clean silhouettes, considered details and an
            easy everyday fit.
          </p>
          <Link className="button button-dark" href="/products">
            Shop collection
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected pieces</p>
            <h2>Featured products</h2>
          </div>
          <Link href="/products" className="text-link">
            View all
          </Link>
        </div>

        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="statement">
        <p className="eyebrow">KLEID.IN standard</p>
        <h2>One wardrobe. Fewer, better pieces.</h2>
      </section>
    </>
  );
}
