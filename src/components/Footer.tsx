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

      <div className="footer-column footer-social-column">
        <span>Social</span>

        <div className="footer-social-links">
          <Link href="/contact" className="footer-social-link" aria-label="Instagram">
            <span className="footer-social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="17.4" cy="6.8" r="1" fill="currentColor" />
              </svg>
            </span>
            <span className="footer-social-name">Instagram</span>
          </Link>

          <Link href="/contact" className="footer-social-link" aria-label="WhatsApp">
            <span className="footer-social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.2 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.6.7c-.2.2-.1.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.6 0 .6-.3 1.4-.8 1.8-.5.5-1.3.8-2.1.6-1.2-.3-2.7-1-4.2-2.4-1.2-1.1-2-2.4-2.4-3.5-.3-.8 0-1.9.5-2.6Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="footer-social-name">WhatsApp</span>
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KLEID.IN</span>
        <span>India / INR</span>
      </div>
    </footer>
  );
}
