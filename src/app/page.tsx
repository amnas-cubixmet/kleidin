import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/data/products";

const categories = [
  { title: "Everyday tees", label: "01", className: "category-blue" },
  { title: "Relaxed fits", label: "02", className: "category-sky" },
  { title: "Core colours", label: "03", className: "category-white" },
];

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <>
      <section className="home-shell">
        <div className="hero-card">
          <div className="hero-copy">
            <p className="hero-label">New collection / 2026</p>
            <h1>Made to wear.<br />Made to repeat.</h1>
            <p className="hero-description">
              Clean silhouettes, useful colours and easy everyday fits.
              KLEID.IN keeps the wardrobe simple.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/products">
                Shop new collection
              </Link>
              <Link className="button button-ghost" href="/about">
                Our story
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <Image
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=90"
              alt="KLEID.IN clothing collection"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 55vw"
              className="hero-image"
            />
            <div className="hero-image-shade" />
            <div className="hero-chip">KLEID.IN / Core collection</div>
          </div>
        </div>

        <div className="benefit-row">
          <span>Easy everyday fits</span>
          <span>Simple WhatsApp ordering</span>
          <span>Designed for repeat wear</span>
        </div>
      </section>

      <section className="section category-section">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Browse the edit</p>
            <h2>Shop by mood</h2>
          </div>
          <Link href="/products" className="text-link">View all products ↗</Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              href="/products"
              className={`category-card ${category.className}`}
              key={category.title}
            >
              <span>{category.label}</span>
              <div>
                <h3>{category.title}</h3>
                <p>Explore collection ↗</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected for you</p>
            <h2>Current favourites</h2>
          </div>
          <p className="section-note">
            Minimal pieces designed to work together.
          </p>
        </div>

        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="promo-wrap">
        <div className="promo-card">
          <div>
            <p className="eyebrow promo-eyebrow">KLEID.IN / Core wardrobe</p>
            <h2>One wardrobe.<br />Fewer, better pieces.</h2>
          </div>
          <div className="promo-side">
            <p>
              Built around versatile T-shirts, relaxed proportions and colours
              that stay easy to style.
            </p>
            <Link className="button button-light" href="/products">
              Explore the collection
            </Link>
          </div>
          <div className="promo-mark" aria-hidden="true">K</div>
        </div>
      </section>

      <section className="newsletter section">
        <div>
          <p className="eyebrow">Stay in the loop</p>
          <h2>New drops, without the noise.</h2>
        </div>
        <div className="newsletter-box">
          <p>Follow the next KLEID.IN release and product updates.</p>
          <Link href="/contact" className="newsletter-link">
            Get updates <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
