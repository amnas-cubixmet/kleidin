import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <Link href="/" className="footer-logo">KLEID.IN</Link>
        <p>Essentials without noise. Unisex clothing for everyday rotation.</p>
      </div>

      <div className="footer-column">
        <span>Explore</span>
        <Link href="/">Home</Link>
        <Link href="/products">Shop</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>

      <div className="footer-column">
        <span>Help</span>
        <Link href="/contact">Shipping</Link>
        <Link href="/contact">Returns</Link>
        <Link href="/contact">Size Guide</Link>
      </div>

      <div className="footer-column">
        <span>Social</span>
        <Link href="/contact">Instagram</Link>
        <Link href="/contact">WhatsApp</Link>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KLEID.IN</span>
        <span>India / INR</span>
      </div>
    </footer>
  );
}
