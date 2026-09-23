import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>KLEID.IN</strong>
        <p>Modern essentials for everyday wear.</p>
      </div>
      <div className="footer-links">
        <Link href="/products">Shop</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
