import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <Link href="/" className="footer-logo">KLEID.IN</Link>
        <p>Essentials without noise. Unisex clothing for everyday rotation.</p>
      </div>

      <div className="footer-column">
        <span>Shop</span>
        <Link href="/products">All Products</Link>
        <Link href="/products#new">New Arrivals</Link>
        <Link href="/products">T-Shirts</Link>
        <Link href="/products">Shirts</Link>
      </div>

      <div className="footer-column">
        <span>Help</span>
        <Link href="/contact">Contact</Link>
        <Link href="/contact">Shipping</Link>
        <Link href="/contact">Returns</Link>
        <Link href="/contact">Size Guide</Link>
      </div>

      <div className="footer-column">
        <span>Brand</span>
        <Link href="/about">About</Link>
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
