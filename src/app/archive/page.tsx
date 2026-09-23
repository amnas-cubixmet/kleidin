import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Archive",
};

const archiveItems = [
  {
    season: "DROP 01 / 2026",
    title: "Core Essentials",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90",
  },
  {
    season: "DROP 02 / 2026",
    title: "Everyday Layers",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90",
  },
  {
    season: "DROP 03 / 2026",
    title: "Blue Study",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90",
  },
];

export default function ArchivePage() {
  return (
    <section className="archive-page">
      <div className="archive-heading">
        <p className="eyebrow">KLEID.IN / Archive</p>
        <h1>Past drops.<br />Still part of the story.</h1>
      </div>

      <div className="archive-grid">
        {archiveItems.map((item) => (
          <article className="archive-card" key={item.title}>
            <div className="archive-image-wrap">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 700px) 100vw, 33vw"
                className="archive-image"
              />
            </div>

            <div className="archive-meta">
              <span>{item.season}</span>
              <h2>{item.title}</h2>
              <Link href="/products">View pieces ↗</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
