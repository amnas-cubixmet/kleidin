"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/#new", label: "New" },
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className={`menu-icon ${open ? "open" : ""}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

export function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return products.slice(0, 5);

    return products
      .filter((product) =>
        [
          product.name,
          product.category,
          ...product.colors,
          ...product.sizes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(value),
      )
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  function closeMenus() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <>
      <div className="announcement">
        <span>New Drop Available</span>
        <span className="announcement-dot">•</span>
        <Link href="/contact">Order on WhatsApp</Link>
      </div>

      <header className="site-header">
        <Link href="/" className="brand" aria-label="KLEID.IN home" onClick={closeMenus}>
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
          <button
            className="icon-button"
            type="button"
            aria-label="Search products"
            aria-expanded={searchOpen}
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen((current) => !current);
            }}
          >
            <SearchIcon />
          </button>

          <Link
            className="cart-link"
            href="/cart"
            aria-label={`Cart with ${itemCount} items`}
            onClick={closeMenus}
          >
            <CartIcon />
            <span>Cart</span>
            <b>{itemCount}</b>
          </Link>

          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => {
              setSearchOpen(false);
              setMenuOpen((current) => !current);
            }}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="mobile-menu">
          <nav aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link key={item.label} href={item.href} onClick={closeMenus}>
                <span>{item.label}</span>
                <span>↗</span>
              </Link>
            ))}
          </nav>

          <button type="button" className="mobile-search-trigger" onClick={openSearch}>
            <SearchIcon />
            <span>Search products</span>
          </button>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="search-panel" role="search">
          <div className="search-panel-inner">
            <div className="search-input-row">
              <SearchIcon />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, categories, colours..."
                aria-label="Search products"
              />
              <button
                type="button"
                className="search-close"
                onClick={() => setSearchOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="search-results">
              <p>{query ? "Search results" : "Popular products"}</p>

              {results.length ? (
                <div className="search-result-list">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={closeMenus}
                    >
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.category} · {product.colors.join(" / ")}</small>
                      </span>
                      <span>↗</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="search-empty">
                  No products found for “{query}”.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
