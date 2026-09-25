import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { OfferHero } from "@/components/OfferHero";
import { getCatalogProducts } from "@/lib/catalog";
import { getActiveOffers } from "@/lib/site-settings";

const categories = [
  { title: "T-Shirts", copy: "Everyday essentials", href: "/products?category=T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=88" },
  { title: "Shirts", copy: "Clean layers", href: "/products?category=Shirts", image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1000&q=88" },
  { title: "Overshirts", copy: "Easy outer layers", href: "/products?category=Overshirts", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=88" },
  { title: "New Arrivals", copy: "Latest drop", href: "/products?new=1", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=88" },
];

export default async function Home() {
  const [products, offers] = await Promise.all([
    getCatalogProducts(),
    getActiveOffers(),
  ]);

  const featured = products.filter((product) => product.featured).slice(0, 3);
  const arrivals = products.slice(0, 4);

  return (
    <div className="reference-home">
      <OfferHero offers={offers} />

      <section className="ref-shell ref-ideas">
        <div className="ref-section-heading">
          <div>
            <p className="ref-kicker">WHAT WE WEAR</p>
            <h2>Everyday pieces<br />that make sense.</h2>
          </div>
          <div className="ref-section-intro">
            <p>A focused wardrobe of clean silhouettes, easy layers and useful colours designed to work together.</p>
            <Link href="/products" className="ref-outline-pill">Explore shop <span>→</span></Link>
          </div>
        </div>

        <div className="ref-category-grid">
          {categories.map((category, index) => (
            <Link href={category.href} className="ref-category-card" key={category.title}>
              <span className="ref-category-index">0{index + 1}</span>
              <div className="ref-category-thumb">
                <Image src={category.image} alt={category.title} fill sizes="(max-width: 700px) 50vw, 25vw" className="ref-category-image" />
              </div>
              <div><h3>{category.title}</h3><p>{category.copy}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ref-shell ref-featured">
        <div className="ref-featured-copy">
          <p className="ref-kicker ref-kicker-light">SELECTED EDIT</p>
          <h2>Featured<br />essentials</h2>
          <p>Three pieces that carry the whole wardrobe — clean, easy and designed for repeat wear.</p>
          <Link href="/products" className="ref-outline-pill ref-outline-light">View all products <span>→</span></Link>
        </div>

        <div className="ref-featured-grid">
          {featured.map((product) => (
            <Link href={`/products/${product.slug}`} className="ref-feature-card" key={product.id}>
              <div className="ref-feature-image-wrap">
                {product.image ? <Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 100vw, 25vw" className="ref-feature-image" /> : null}
              </div>
              <div className="ref-feature-meta"><span>{product.category}</span><strong>{product.name}</strong></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ref-shell ref-testimonial-cta">
        <article className="ref-testimonial">
          <p className="ref-kicker">THE KLEID.IN IDEA</p>
          <div className="ref-quote-mark">“</div>
          <blockquote>Clothes should make getting dressed easier, not louder.</blockquote>
          <div className="ref-quote-person"><span className="ref-avatar">K</span><div><strong>KLEID.IN</strong><small>Everyday essentials</small></div></div>
        </article>

        <article className="ref-big-cta">
          <div className="ref-big-cta-bg" />
          <p className="ref-kicker ref-kicker-light">LET&apos;S KEEP IT SIMPLE</p>
          <h2>Ready to build<br />your rotation?</h2>
          <p>Start with the pieces you&apos;ll actually wear every week.</p>
          <Link href="/products" className="ref-pill ref-pill-light">Shop collection <span>→</span></Link>
        </article>
      </section>

      <section className="ref-shell ref-arrivals">
        <div className="ref-arrivals-head">
          <div><p className="ref-kicker">NEW ARRIVALS</p><h2>Fresh in.</h2></div>
          <Link href="/products" className="ref-outline-pill">View all <span>→</span></Link>
        </div>
        <div className="ref-arrival-grid">
          {arrivals.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="ref-brand-strip">
        <div className="ref-brand-strip-inner">
          <p>KLEID.IN</p>
          <h2>ONE WARDROBE.<br />NO LABELS.</h2>
          <Link href="/about" className="ref-pill ref-pill-light">About us <span>→</span></Link>
        </div>
      </section>
    </div>
  );
}
