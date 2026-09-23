import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/data/products";

const categories = [
  { title: "Everyday tees", label: "01", className: "category-lilac" },
  { title: "Relaxed fits", label: "02", className: "category-peach" },
  { title: "Core colours", label: "03", className: "category-mint" },
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

          <div className="hero-visual" aria-label="KLEID.IN collection preview">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="look-card look-card-left">
              <span>01</span>
              <strong>BLACK</strong>
              <small>Essential tee</small>
            </div>
            <div className="look-card look-card-main">
              <span>KLEID.IN</span>
              <strong>K</strong>
              <small>CORE / 26</small>
            </div>
            <div className="look-card look-card-right">
              <span>02</span>
              <strong>STONE</strong>
              <small>Relaxed tee</small>
            </div>
            <div className="hero-chip">4 fits · 3 colours</div>
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
