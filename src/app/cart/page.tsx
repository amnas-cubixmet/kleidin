"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <section className="cart-page">
      <div className="cart-heading">
        <p className="eyebrow">Your cart</p>
        <h1>Cart</h1>
        <span>{items.length} item types</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty.</h2>
          <p>Add a few KLEID.IN essentials and they will appear here.</p>
          <Link href="/products" className="button button-primary">
            Shop products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.key}>
                <Link href={`/products/${item.slug}`} className="cart-item-image">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="140px"
                    />
                  ) : null}
                </Link>

                <div className="cart-item-copy">
                  <div>
                    <Link href={`/products/${item.slug}`} className="cart-item-name">
                      {item.name}
                    </Link>
                    <p>{item.color} / {item.size}</p>
                  </div>

                  <div className="cart-item-controls">
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

                    <strong>{formatPrice(item.price * item.quantity)}</strong>

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

            <button type="button" className="clear-cart" onClick={clearCart}>
              Clear cart
            </button>
          </div>

          <aside className="cart-summary">
            <p className="eyebrow">Summary</p>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className="summary-note">
              Shipping and final order details can be confirmed directly with KLEID.IN.
            </p>
            <Link href="/contact" className="button button-primary cart-checkout">
              Continue on WhatsApp
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
