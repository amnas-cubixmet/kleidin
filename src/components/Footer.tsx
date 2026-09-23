import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <strong>KLEID.IN</strong>
        <p>Clean clothing for everyday rotation.</p>
      </div>

      <div className="footer-group">
        <span>Shop</span>
        <Link href="/products">All products</Link>
        <Link href="/products">New arrivals</Link>
      </div>

      <div className="footer-group">
        <span>Info</span>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>

      <div className="footer-end">
        <span>India / INR</span>
        <span>© {new Date().getFullYear()} KLEID.IN</span>
      </div>
    </footer>
  );
}
