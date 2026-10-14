import Link from "next/link";

/** Editorial navigation: links to real routes and existing homepage anchors only. */
const destinations = [
  { number: "01", title: "Explore the collection", href: "/products" },
  { number: "02", title: "Discover our approach", href: "/#about" },
  { number: "03", title: "Become a stockist", href: "/wholesale" },
] as const;

export function HomeCollectionGuide() {
  return (
    <section className="kleid-edit-band" aria-labelledby="kleid-edit-title">
      <div>
        <p className="kleid-edit-kicker">KLEID.IN / Designed to be worn</p>
        <h2 id="kleid-edit-title" className="kleid-edit-title">
          Less ordinary.<br />
          <em>More everyday.</em>
        </h2>
      </div>
      <nav className="kleid-edit-links" aria-label="Explore KLEID.IN">
        {destinations.map((item) => (
          <Link className="kleid-edit-link" href={item.href} key={item.number}>
            <span className="kleid-edit-index">{item.number}</span>
            <strong>{item.title}</strong>
            <span className="kleid-edit-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
