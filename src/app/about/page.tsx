import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <section className="section page-section editorial-page">
      <p className="eyebrow">About KLEID.IN</p>
      <h1>Clothing designed to stay in rotation.</h1>
      <div className="editorial-copy">
        <p>
          KLEID.IN is built around a simple idea: make modern everyday pieces
          that are easy to wear and easy to return to.
        </p>
        <p>
          The collection focuses on clean silhouettes, useful colours and
          straightforward product choices.
        </p>
      </div>
    </section>
  );
}
