import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductActions } from "@/components/ProductActions";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getActiveProducts, getProductBySlug } from "@/data/products";
import { formatPrice, getWhatsappUrl } from "@/lib/format";
import { store } from "@/config/store";

const categories = [
  {
    title: "T-Shirts",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=88",
  },
  {
    title: "Shirts",
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1000&q=88",
  },
  {
    title: "Overshirts",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=88",
  },
  {
    title: "New Arrivals",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=88",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=88",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=88",
  "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1000&q=88",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=88",
];

const socialImages = [
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",
];

export default function Home() {
  const products = getActiveProducts();
  const newArrivals = products.slice(0, 8);
  const bestSellers = products.slice(0, 4);
  const highlight = getProductBySlug("essential-tee-black") ?? products[0];
  const whatsappUrl = getWhatsappUrl();
  const whatsappReady = Boolean(store.whatsappNumber);

  return (
    <>
      <section className="hero-section">
        <div className="hero-image-wrap">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=92"
            alt="KLEID.IN fashion essentials"
            fill
            priority
            sizes="100vw"
            className="hero-image"
          />
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">KLEID.IN / 2026</p>
          <h1>ESSENTIALS<br />WITHOUT NOISE</h1>
          <p className="hero-copy">
            Unisex everyday clothing with clean proportions, useful colours and
            effortless styling.
          </p>
          <Link className="button button-white" href="/products">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="home-section" id="new">
        <div className="section-head">
          <div>
            <p className="eyebrow">01 / New Arrivals</p>
            <h2>Fresh in</h2>
          </div>
          <Link href="/products" className="section-link">View all ↗</Link>
        </div>

        <div className="product-grid product-grid-four">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-section category-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">02 / Categories</p>
            <h2>Shop by category</h2>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link href="/products" className="category-card" key={category.title}>
              <Image
                src={category.image}
                alt={category.title}
                fill
                sizes="(max-width: 700px) 50vw, 25vw"
                className="category-image"
              />
              <div className="category-overlay" />
              <div className="category-label">
                <h3>{category.title}</h3>
                <span>Shop ↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-collection">
        <div className="featured-image-wrap">
          <Image
            src="https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1600&q=90"
            alt="KLEID.IN featured collection"
            fill
            sizes="(max-width: 900px) 100vw, 60vw"
            className="featured-image"
          />
        </div>

        <div className="featured-copy">
          <p className="eyebrow">03 / Featured Collection</p>
          <h2>The Core Edit</h2>
          <p>
            A focused set of tees, shirts and layers designed to work together
            every day.
          </p>
          <Link href="/products" className="button button-primary">
            Shop Collection
          </Link>
        </div>
      </section>

      <section className="home-section best-sellers-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">04 / Best Sellers</p>
            <h2>Most worn</h2>
          </div>
        </div>

        <div className="best-seller-grid">
          {bestSellers.map((product) => (
            <article className="best-seller-card" key={product.id}>
              <Link href={`/products/${product.slug}`} className="best-seller-media">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 700px) 100vw, 25vw"
                    className="best-seller-image"
                  />
                ) : null}
              </Link>

              <div className="best-seller-info">
                <div>
                  <h3>{product.name}</h3>
                  <p>{formatPrice(product.price)}</p>
                </div>
                <ProductActions product={product} compact />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-statement">
        <p>KLEID.IN</p>
        <h2>ONE WARDROBE.<br />NO LABELS.</h2>
      </section>

      {highlight ? (
        <section className="product-highlight">
          <div className="product-highlight-media">
            {highlight.image ? (
              <Image
                src={highlight.image}
                alt={highlight.name}
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                className="highlight-image"
              />
            ) : null}
          </div>

          <div className="product-highlight-copy">
            <p className="eyebrow">05 / Product Highlight</p>
            <h2>{highlight.name}</h2>
            <p className="highlight-price">{formatPrice(highlight.price)}</p>
            <p className="highlight-description">{highlight.description}</p>

            <div className="highlight-meta">
              <span>Colour</span>
              <strong>{highlight.colors.join(" / ")}</strong>
            </div>

            <ProductActions
              product={highlight}
              whatsappUrl={
                whatsappReady ? getWhatsappUrl(highlight.name) : undefined
              }
            />
          </div>
        </section>
      ) : null}

      <section className="home-section why-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">06 / Why KLEID.IN</p>
            <h2>Made to simplify getting dressed</h2>
          </div>
        </div>

        <div className="why-grid">
          {[
            ["01", "Unisex by default", "Designed around fit and form, not labels."],
            ["02", "Everyday comfort", "Easy fabrics and proportions built for repeat wear."],
            ["03", "Minimal design", "Clean details that stay useful beyond one season."],
            ["04", "Easy styling", "A focused palette that works together without effort."],
          ].map(([number, title, copy]) => (
            <article className="why-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lookbook-section">
        <div className="lookbook-head">
          <div>
            <p className="eyebrow">07 / Lookbook</p>
            <h2>Worn your way</h2>
          </div>
          <Link href="/products" className="section-link">Shop the look ↗</Link>
        </div>

        <div className="lookbook-grid">
          {gallery.map((image, index) => (
            <div className="lookbook-item" key={image}>
              <Image
                src={image}
                alt={`KLEID.IN lookbook ${index + 1}`}
                fill
                sizes="(max-width: 700px) 50vw, 25vw"
                className="lookbook-image"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="whatsapp-section">
        <div>
          <p className="eyebrow whatsapp-eyebrow">08 / Direct Order</p>
          <h2>Like something?<br />Order directly on WhatsApp.</h2>
        </div>
        <a
          className="button button-white"
          href={whatsappReady ? whatsappUrl : "/contact"}
          target={whatsappReady ? "_blank" : undefined}
          rel={whatsappReady ? "noreferrer" : undefined}
        >
          Order on WhatsApp
        </a>
      </section>

      <section className="newsletter-section">
        <div>
          <p className="eyebrow">09 / Updates</p>
          <h2>New drops. Restocks. Nothing extra.</h2>
        </div>
        <div className="newsletter-side">
          <p>Subscribe for product releases and KLEID.IN updates.</p>
          <NewsletterForm />
        </div>
      </section>

      <section className="social-section">
        <div className="social-head">
          <div>
            <p className="eyebrow">10 / Social</p>
            <h2>@kleid.in</h2>
          </div>
          <Link href="/contact" className="section-link">Instagram ↗</Link>
        </div>

        <div className="social-grid">
          {socialImages.map((image, index) => (
            <div className="social-item" key={image}>
              <Image
                src={image}
                alt={`KLEID.IN social image ${index + 1}`}
                fill
                sizes="(max-width: 700px) 33vw, 16vw"
                className="social-image"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
