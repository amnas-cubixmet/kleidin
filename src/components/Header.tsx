import Link from "next/link";

const nav = [
  { href: "/products", label: "New in" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <>
      <div className="announcement">
        <span>Free shipping on orders over ₹1,999</span>
        <span className="announcement-side">KLEID.IN — Everyday essentials</span>
      </div>

      <header className="site-header">
        <Link href="/" className="brand" aria-label="KLEID.IN home">
          KLEID.IN
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          {nav.map((item, index) => (
            <Link key={`${item.href}-${index}`} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/products">Search</Link>
          <Link href="/contact">Bag <span className="bag-count">0</span></Link>
        </div>
      </header>
    </>
  );
}
