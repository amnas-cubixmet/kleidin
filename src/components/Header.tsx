"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";

const shopLinks = [
  { href: "/products", label: "Shop All", note: "All KLEID.IN pieces" },
  { href: "/products?new=1", label: "New Arrivals", note: "Latest drop" },
  { href: "/products?category=T-Shirts", label: "T-Shirts", note: "Everyday essentials" },
  { href: "/products?category=Shirts", label: "Shirts", note: "Clean layers" },
  { href: "/products?category=Overshirts", label: "Overshirts", note: "Easy outer layers" },
  { href: "/archive", label: "Archive", note: "Past collections" },
];

const motionImages = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=86",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=86",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=86",
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

function Chevron({ open }: { open: boolean }) {
  return <span className={`nav-chevron ${open ? "open" : ""}`}>⌄</span>;
}

export function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
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
        setShopOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openSearch() {
    setShopOpen(false);
    setMenuOpen(false);
    setSearchOpen(true);
  }

  function closeMenus() {
    setShopOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
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
        <Link href="/" className="brand" aria-label="KLEID.IN home" onClick={closeMenus}>
          KLEID.IN
        </Link>

        <nav className="nav desktop-nav" aria-label="Primary navigation">
          <Link href="/" onClick={closeMenus}>Home</Link>

          <button
            type="button"
            className="shop-nav-trigger"
            aria-expanded={shopOpen}
            onClick={() => {
              setSearchOpen(false);
              setShopOpen((current) => !current);
            }}
            onMouseEnter={() => {
              setSearchOpen(false);
              setShopOpen(true);
            }}
          >
            Shop
            <Chevron open={shopOpen} />
          </button>

          <Link href="/contact" onClick={closeMenus}>Contact</Link>
        </nav>

        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            aria-label="Search products"
            aria-expanded={searchOpen}
            onClick={() => {
              setShopOpen(false);
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
              setShopOpen(false);
              setMenuOpen((current) => !current);
            }}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {shopOpen ? (
        <div
          className={`shop-mega-menu ${announcementVisible ? "" : "announcement-hidden"}`}
          onMouseLeave={() => setShopOpen(false)}
        >
          <div className="shop-mega-inner">
            <Link href="/products?new=1" className="shop-motion-card" onClick={closeMenus}>
              <div className="shop-motion-frames" aria-hidden="true">
                {motionImages.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    fill
                    sizes="420px"
                    className={`shop-motion-image shop-motion-image-${index + 1}`}
                  />
                ))}
              </div>
              <div className="shop-motion-overlay" />
              <div className="shop-motion-copy">
                <span>Fashion motion / 2026</span>
                <strong>THE NEW DROP</strong>
                <small>View collection ↗</small>
              </div>
            </Link>

            <div className="shop-mega-links">
              <div className="shop-mega-title">
                <span>Shop KLEID.IN</span>
                <Link href="/products" onClick={closeMenus}>View all ↗</Link>
              </div>

              <div className="shop-mega-grid">
                {shopLinks.map((item, index) => (
                  <Link href={item.href} key={item.label} onClick={closeMenus}>
                    <span className="shop-link-index">0{index + 1}</span>
                    <span className="shop-link-copy">
                      <strong>{item.label}</strong>
                      <small>{item.note}</small>
                    </span>
                    <span>↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className={`mobile-menu ${announcementVisible ? "" : "announcement-hidden"}`}>
          <nav aria-label="Mobile navigation">
            <Link href="/" onClick={closeMenus}>
              <span>Home</span><span>↗</span>
            </Link>

            <button
              type="button"
              className="mobile-shop-toggle"
              onClick={() => setMobileShopOpen((current) => !current)}
            >
              <span>Shop</span>
              <Chevron open={mobileShopOpen} />
            </button>

            {mobileShopOpen ? (
              <div className="mobile-shop-links">
                {shopLinks.map((item) => (
                  <Link href={item.href} key={item.label} onClick={closeMenus}>
                    <span>{item.label}</span>
                    <small>{item.note}</small>
                  </Link>
                ))}
              </div>
            ) : null}

            <Link href="/contact" onClick={closeMenus}>
              <span>Contact</span><span>↗</span>
            </Link>
          </nav>

          <div className="mobile-motion-card">
            <div className="mobile-motion-image-wrap">
              <Image
                src={motionImages[0]}
                alt="KLEID.IN fashion preview"
                fill
                sizes="100vw"
                className="mobile-motion-image"
              />
            </div>
            <span>Fashion preview / New drop</span>
          </div>

          <button type="button" className="mobile-search-trigger" onClick={openSearch}>
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
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
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
                <div className="search-empty">No products found for “{query}”.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
