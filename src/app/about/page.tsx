import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "KLEID.IN creates modern everyday clothing built around clean silhouettes, useful colours and repeat wear.",
};

export default function AboutPage() {
  return (
    <section className="section page-section editorial-page">
      <p className="eyebrow">About KLEID.IN</p>
      <h1>Clothing designed to stay in rotation.</h1>

      <div className="editorial-copy">
        <p>
          KLEID.IN is an independent everyday-wear concept focused on pieces
          that feel considered without becoming complicated. The collection is
          built around clean proportions, practical colours and easy layering.
        </p>

        <p>
          Rather than chasing a different look every week, the aim is to make a
          tighter wardrobe work harder: dependable tees, shirts, trousers,
          lightweight outerwear and accessories that can be worn repeatedly
          across different settings.
        </p>

        <p>
          Fit, fabric weight and versatility guide each product decision, with
          a simple goal — make getting dressed easier.
        </p>
      </div>
    </section>
  );
}
