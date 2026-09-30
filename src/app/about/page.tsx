import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "KLEID.IN creates modern everyday clothing built around clean silhouettes, useful colours and repeat wear.",
};

const principles = [
  {
    number: "01",
    title: "Wear more",
    copy: "Fewer pieces, chosen to work harder across everyday rotation.",
  },
  {
    number: "02",
    title: "Keep it clear",
    copy: "Clean silhouettes, useful colours and details that do not fight for attention.",
  },
  {
    number: "03",
    title: "Built for repeat",
    copy: "Fit, fabric weight and versatility guide every product decision.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-top">
          <p className="about-kicker">KLEID.IN / ABOUT</p>
          <p className="about-index">01 — 04</p>
        </div>

        <div className="about-hero-main">
          <h1>
            One wardrobe.
            <br />
            Less noise.
          </h1>

          <div className="about-hero-note">
            <p>
              Everyday clothing built around clean proportions, practical
              colours and repeat wear.
            </p>
            <Link href="/products" className="about-pill">
              Explore the collection
            </Link>
          </div>
        </div>

        <div className="about-hero-foot">
          <span>Independent everyday wear</span>
          <span>Designed for rotation</span>
        </div>
      </section>

      <section className="about-statement">
        <div className="about-statement-label">
          <span>02</span>
          <p>Why KLEID.IN</p>
        </div>

        <div className="about-statement-copy">
          <p>
            We are interested in the clothes that stay close — the pieces you
            reach for without thinking.
          </p>
          <p>
            KLEID.IN is an independent everyday-wear concept focused on making
            a tighter wardrobe work harder. Instead of chasing a new look every
            week, the collection is built around dependable tees, shirts,
            trousers, lightweight layers and accessories that can move across
            different settings.
          </p>
        </div>
      </section>

      <section className="about-principles">
        <div className="about-section-head">
          <div>
            <p className="about-kicker">03 / PRINCIPLES</p>
            <h2>Made to stay in rotation.</h2>
          </div>
          <p className="about-section-intro">
            Simple decisions, repeated consistently.
          </p>
        </div>

        <div className="about-principle-grid">
          {principles.map((item) => (
            <article className="about-principle-card" key={item.number}>
              <span>{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-final">
        <div className="about-final-copy">
          <p className="about-kicker">04 / THE IDEA</p>
          <h2>
            Getting dressed
            <br />
            should feel easier.
          </h2>
        </div>

        <div className="about-final-side">
          <p>
            Fit, fabric weight and versatility guide the collection. The goal
            is simple: make useful clothing that earns its place in your
            wardrobe.
          </p>
          <Link href="/products" className="about-pill about-pill-light">
            Shop KLEID.IN
          </Link>
        </div>
      </section>
    </main>
  );
}
