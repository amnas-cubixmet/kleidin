"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const nav = [
  { href: "/products", label: "Shop" },
  { href: "/products#new", label: "New" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h2l1.8 9.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H7" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function Header() {
  const { itemCount } = useCart();

  return (
    <>
      <div className="announcement">
        <span>New Drop Available</span>
        <span className="announcement-dot">•</span>
        <Link href="/contact">Order on WhatsApp</Link>
      </div>

      <header className="site-header">
        <Link href="/" className="brand" aria-label="KLEID.IN home">
          KLEID.IN
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="icon-link" href="/products" aria-label="Search products">
            <SearchIcon />
          </Link>

          <Link className="cart-link" href="/cart" aria-label={`Cart with ${itemCount} items`}>
            <CartIcon />
            <span>Cart</span>
            <b>{itemCount}</b>
          </Link>
        </div>
      </header>
    </>
  );
}
