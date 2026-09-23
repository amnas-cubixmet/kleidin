import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/data/products";

const categoryCards = [
  {
    title: "T-Shirts",
    subtitle: "Everyday essentials",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90",
  },
  {
    title: "Relaxed Fit",
    subtitle: "Easy proportions",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=90",
  },
  {
    title: "Core Colours",
    subtitle: "Black, white, stone",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=90",
  },
];

const colourCards = [
  { name: "Blue", className: "swatch-blue" },
  { name: "White", className: "swatch-white" },
  { name: "Black", className: "swatch-black" },
  { name: "Stone", className: "swatch-stone" },
];

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <>
      <section className="home-shell home-hero-shell">
        <div className="hero-card hero-card-v2">
          <div className="hero-copy hero-copy-v2">
            <p className="hero-label">KLEID.IN / New collection</p>
            <h1>Everyday essentials, done better.</h1>
            <p className="hero-description">
              Clean fits, dependable fabrics and a simple wardrobe built for
              repeat wear.
            </p>

            <div className="hero-actions">
              <Link className="button button-primary" href="/products">
                Shop collection
              </Link>
              <Link className="button button-ghost" href="/about">
                About KLEID.IN
              </Link>
            </div>

            <div className="hero-meta">
              <div>
                <strong>01</strong>
                <span>Core fits</span>
              </div>
              <div>
                <strong>04</strong>
                <span>Essential colours</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Everyday focus</span>
              </div>
            </div>
          </div>

          <div className="hero-visual hero-visual-v2">
            <Image
              src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1600&q=92"
              alt="KLEID.IN everyday fashion"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 55vw"
              className="hero-image"
            />
            <div className="hero-image-shade" />
            <div className="hero-badge">New drop / 2026</div>
          </div>
        </div>

        <div className="benefit-row benefit-row-v2">
          <span>Free shipping above ₹1,999</span>
          <span>Easy WhatsApp ordering</span>
          <span>Simple size options</span>
          <span>Made for repeat wear</span>
        </div>
      </section>

      <section className="section home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Shop the collection</p>
            <h2>Find your everyday fit</h2>
          </div>
          <Link href="/products" className="text-link">
            Shop all ↗
          </Link>
        </div>

        <div className="home-category-grid">
          {categoryCards.map((item) => (
            <Link href="/products" className="home-category-card" key={item.title}>
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 700px) 100vw, 33vw"
                className="home-category-image"
              />
              <div className="home-category-overlay" />
              <div className="home-category-copy">
                <span>{item.subtitle}</span>
                <h3>{item.title}</h3>
                <p>Explore collection ↗</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section home-section home-products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">New arrivals</p>
            <h2>Fresh in</h2>
          </div>
          <p className="section-note">
            Clean wardrobe staples in simple colours and easy silhouettes.
          </p>
        </div>

        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="editorial-section">
        <div className="editorial-media">
          <Image
            src="https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1600&q=90"
            alt="KLEID.IN editorial fashion"
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            className="editorial-image"
          />
        </div>

        <div className="editorial-content">
          <p className="eyebrow">The KLEID.IN standard</p>
          <h2>Less noise. Better basics.</h2>
          <p>
            We focus on the pieces you actually reach for every week: clean
            tees, relaxed proportions and colours that work together.
          </p>
          <Link href="/about" className="button button-primary">
            Read our story
          </Link>
        </div>
      </section>

      <section className="section home-section colour-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Core palette</p>
            <h2>Shop by colour</h2>
          </div>
          <p className="section-note">
            Easy colours designed to mix without overthinking.
          </p>
        </div>

        <div className="colour-grid">
          {colourCards.map((colour) => (
            <Link href="/products" className="colour-card" key={colour.name}>
              <span className={`colour-swatch ${colour.className}`} />
              <div>
                <strong>{colour.name}</strong>
                <span>View products ↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="best-seller-section">
        <div className="best-seller-copy">
          <p className="eyebrow">Best seller</p>
          <h2>The everyday tee.</h2>
          <p>
            A clean regular fit designed for easy layering, repeat wear and
            simple styling.
          </p>

          <div className="best-seller-price">
            <strong>From ₹1,299</strong>
            <span>Black / White / Graphite</span>
          </div>

          <Link href="/products/essential-tee-black" className="button button-primary">
            Shop the tee
          </Link>
        </div>

        <div className="best-seller-image-wrap">
          <Image
            src="https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=90"
            alt="Black essential T-shirt"
            fill
            sizes="(max-width: 900px) 100vw, 52vw"
            className="best-seller-image"
          />
        </div>
      </section>

      <section className="section home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Why KLEID.IN</p>
            <h2>Simple by design</h2>
          </div>
        </div>

        <div className="values-grid">
          <article className="value-card">
            <span>01</span>
            <h3>Clean fits</h3>
            <p>Balanced silhouettes that feel current without feeling temporary.</p>
          </article>

          <article className="value-card">
            <span>02</span>
            <h3>Useful colours</h3>
            <p>A focused palette made to pair easily across your wardrobe.</p>
          </article>

          <article className="value-card">
            <span>03</span>
            <h3>Easy ordering</h3>
            <p>Simple product choices and direct WhatsApp support when needed.</p>
          </article>
        </div>
      </section>

      <section className="promo-wrap home-promo-wrap">
        <div className="promo-card home-promo-card">
          <div>
            <p className="eyebrow promo-eyebrow">KLEID.IN / Essentials</p>
            <h2>Build a wardrobe you actually wear.</h2>
          </div>

          <div className="promo-side">
            <p>
              Start with a few dependable pieces, then repeat them your way.
            </p>
            <Link className="button button-light" href="/products">
              Shop essentials
            </Link>
          </div>

          <div className="promo-mark" aria-hidden="true">K</div>
        </div>
      </section>

      <section className="section newsletter home-newsletter">
        <div>
          <p className="eyebrow">Stay updated</p>
          <h2>New drops, restocks and product updates.</h2>
        </div>

        <div className="newsletter-box">
          <p>
            Contact KLEID.IN directly for release updates, sizing help and
            product availability.
          </p>
          <Link href="/contact" className="newsletter-link">
            Contact us <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
