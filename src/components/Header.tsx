"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { getCartWhatsappUrl } from "@/lib/format";
import type { Product } from "@/types/product";
import type { StoreSettings } from "@/types/commerce";

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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

export function Header({
  products,
  settings,
}: {
  products: Product[];
  settings: StoreSettings;
}) {
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
  const [cartClosing, setCartClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function handleCloseCart() {
    if (cartClosing) return;
    setCartClosing(true);
    window.setTimeout(() => {
      setCartOpen(false);
      setCartClosing(false);
    }, 300);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return products.slice(0, 6);

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
      .slice(0, 8);
  }, [query, products]);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem("kleidin-announcement-dismissed");
      if (dismissed === "true") setAnnouncementVisible(false);
    } catch {}
  }, []);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        if (cartOpen) handleCloseCart();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cartOpen, cartClosing]);

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  function closePanels() {
    setMenuOpen(false);
    setSearchOpen(false);
    if (cartOpen) handleCloseCart();
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
    } catch {}
  }

  const announcementHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}`
    : "/contact";

  const checkoutUrl = getCartWhatsappUrl(
    items,
    subtotal,
    settings.whatsappNumber,
  );

  return (
    <>
      {announcementVisible && settings.announcementText.trim() ? (
        <div className="announcement">
          <div className="announcement-copy">
            <span>{settings.announcementText}</span>
            {settings.announcementLinkLabel.trim() ? (
              <>
                <span className="announcement-dot">•</span>
                <a
                  href={announcementHref}
                  target={settings.whatsappNumber ? "_blank" : undefined}
                  rel={settings.whatsappNumber ? "noreferrer" : undefined}
                >
                  {settings.announcementLinkLabel}
                </a>
              </>
            ) : null}
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
            <span className="cart-icon-wrap">
              <CartIcon />
              {itemCount > 0 ? <b className="cart-count-badge">{itemCount}</b> : null}
            </span>
            <span className="cart-label">Cart</span>
          </button>

          <button
            ref={menuButtonRef}
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
        <div
          ref={menuRef}
          className="mobile-compact-card"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <nav className="mobile-card-nav" aria-label="Mobile navigation">
            {nav.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`mobile-card-link ${isActive(item.href) ? "active" : ""}`}
                style={{ animationDelay: `${130 + index * 40}ms` }}
                onClick={closePanels}
              >
                <span>{item.label}</span>
                <span className="mobile-card-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
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
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <CloseIcon />
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
                      className="search-result-item"
                      onClick={closePanels}
                    >
                      <div className="search-result-thumb">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="search-result-img"
                          />
                        ) : (
                          <div className="search-result-placeholder">
                            <span>{product.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      <div className="search-result-info">
                        <strong className="search-result-title">{product.name}</strong>
                        <small className="search-result-meta">
                          {product.category}{product.colors?.length ? ` · ${product.colors.join(" / ")}` : ""}
                        </small>
                      </div>

                      <span className="search-result-arrow" aria-hidden="true">↗</span>
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
        <div
          className={`cart-drawer-layer ${cartClosing ? "cart-closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
          <button
            type="button"
            className="cart-drawer-backdrop"
            aria-label="Close cart"
            onClick={handleCloseCart}
          />

          <aside className="cart-drawer">
            <div className="cart-drawer-head">
              <div>
                <span>Your cart</span>
                <strong>{itemCount} items</strong>
              </div>
              <button type="button" onClick={handleCloseCart} aria-label="Close cart">×</button>
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
                        <Link href={`/products/${item.slug}`} className="cart-drawer-image" onClick={closePanels}>
                          {item.image ? <Image src={item.image} alt={item.name} fill sizes="92px" /> : null}
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
                              <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                              <span>{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                            </div>
                            <button type="button" className="remove-button" onClick={() => removeItem(item.key)}>
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

                    {checkoutUrl !== "#" ? (
                      <a
                        href={checkoutUrl}
                        className="button button-primary"
                        target="_blank"
                        rel="noreferrer"
                        onClick={closePanels}
                      >
                        Order on WhatsApp
                      </a>
                    ) : (
                      <Link href="/contact" className="button button-primary" onClick={closePanels}>
                        Add WhatsApp number
                      </Link>
                    )}

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
