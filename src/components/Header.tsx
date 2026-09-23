import Link from "next/link";

const nav = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="KLEID.IN home">
        KLEID.IN
      </Link>

      <nav className="nav" aria-label="Primary navigation">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
