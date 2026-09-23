"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className={`menu-icon ${open ? "open" : ""}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function Header() {
  const pathname = usePathname();
  const {
    items,
    itemCount,
    subtotal,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [announcementVisible, setAnnouncementVisible] = useState(true);
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
    try {
      const dismissed = window.localStorage.getItem("kleidin-announcement-dismissed");
      if (dismissed === "true") setAnnouncementVisible(false);
    } catch {
      // Keep announcement visible when storage is unavailable.
    }
  }, []);

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
        setCartOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function closePanels() {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/products") return pathname.startsWith("/products");
    return pathname === href;
  }

  function dismissAnnouncement() {
    setAnnouncementVisible(false);

    try {
      window.localStorage.setItem("kleidin-announcement-dismissed", "true");
    } catch {
      // Still close for the current page.
    }
  }

  return (
    <>
      {announcementVisible ? (
        <div className="announcement">
          <div className="announcement-copy">
            <span>New Drop Available</span>
            <span className="announcement-dot">•</span>
            <Link href="/contact">Order on WhatsApp</Link>
          </div>
          <button
            type="button"
            className="announcement-close"
            aria-label="Close announcement"
            onClick={dismissAnnouncement}
          >
            ×
          </button>
        </div>
      ) : null}

      <header className="site-header">
        <Link href="/" className="brand" aria-label="KLEID.IN home" onClick={closePanels}>
          KLEID.IN
        </Link>

        <nav className="nav desktop-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              onClick={closePanels}
            >
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
              setCartOpen(false);
              setSearchOpen((current) => !current);
            }}
          >
            <SearchIcon />
          </button>

          <button
            className="cart-link cart-button"
            type="button"
            aria-label={`Open cart with ${itemCount} items`}
            aria-expanded={cartOpen}
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(false);
              setCartOpen(true);
            }}
          >
            <CartIcon />
            <span>Cart</span>
            <b>{itemCount}</b>
          </button>

          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => {
              setSearchOpen(false);
              setCartOpen(false);
              setMenuOpen((current) => !current);
            }}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className={`mobile-menu ${announcementVisible ? "" : "announcement-hidden"}`}>
          <nav aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
                onClick={closePanels}
              >
                <span>{item.label}</span>
                <span>↗</span>
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="mobile-search-trigger"
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          >
            <SearchIcon />
            <span>Search products</span>
          </button>
        </div>
      ) : null}

      {searchOpen ? (
        <div
          className={`search-panel ${announcementVisible ? "" : "announcement-hidden"}`}
          role="search"
        >
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
                      onClick={closePanels}
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
                <div className="search-empty">No products found for “{query}”.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {cartOpen ? (
        <div className="cart-drawer-layer" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <button
            type="button"
            className="cart-drawer-backdrop"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          />

          <aside className="cart-drawer">
            <div className="cart-drawer-head">
              <div>
                <span>Your cart</span>
                <strong>{itemCount} items</strong>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart">
                ×
              </button>
            </div>

            <div className="cart-drawer-body">
              {items.length === 0 ? (
                <div className="cart-drawer-empty">
                  <h2>Your cart is empty.</h2>
                  <p>Add something from the shop and it will appear here.</p>
                  <Link href="/products" className="button button-primary" onClick={closePanels}>
                    Shop products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="cart-drawer-items">
                    {items.map((item) => (
                      <article className="cart-drawer-item" key={item.key}>
                        <Link
                          href={`/products/${item.slug}`}
                          className="cart-drawer-image"
                          onClick={closePanels}
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="92px"
                            />
                          ) : null}
                        </Link>

                        <div className="cart-drawer-item-copy">
                          <div className="cart-drawer-item-top">
                            <div>
                              <Link href={`/products/${item.slug}`} onClick={closePanels}>
                                {item.name}
                              </Link>
                              <small>{item.color} / {item.size}</small>
                            </div>
                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                          </div>

                          <div className="cart-drawer-controls">
                            <div className="quantity-control">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              >
                                −
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              className="remove-button"
                              onClick={() => removeItem(item.key)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="cart-drawer-footer">
                    <div className="cart-drawer-subtotal">
                      <span>Subtotal</span>
                      <strong>{formatPrice(subtotal)}</strong>
                    </div>
                    <Link href="/contact" className="button button-primary" onClick={closePanels}>
                      Continue on WhatsApp
                    </Link>
                    <button type="button" className="clear-cart" onClick={clearCart}>
                      Clear cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
