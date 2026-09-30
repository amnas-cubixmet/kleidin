import { store } from "@/config/store";
import type { CartItem } from "@/context/CartContext";
import type { Product } from "@/types/product";

export function formatPrice(value: number) {
  return new Intl.NumberFormat(store.locale, {
    style: "currency",
    currency: store.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getWhatsappUrl(
  productName?: string,
  whatsappNumber = store.whatsappNumber,
) {
  if (!whatsappNumber) return "#";

  const message = productName
    ? `Hi, I want to order ${productName} from KLEID.IN.`
    : "Hi, I want to know more about KLEID.IN products.";

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getCartWhatsappUrl(
  items: CartItem[],
  subtotal: number,
  whatsappNumber: string,
) {
  if (!whatsappNumber || !items.length) return "#";

  const lines = [
    "Hi KLEID.IN, I would like to place this order:",
    "",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.name} — ${item.color} / ${item.size} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
    ),
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    "",
    "Please confirm availability and delivery details.",
  ];

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}


export function getProductWhatsappUrl(
  product: Product,
  whatsappNumber = store.whatsappNumber,
  selectedColor?: string,
  selectedSize?: string,
) {
  if (!whatsappNumber) return "#";

  const lines = [
    "Hi KLEID.IN, I’m interested in this product:",
    "",
    product.name,
    `Price: ${formatPrice(product.price)}`,
    `Product: /products/${product.slug}`,
    selectedColor ? `Colour: ${selectedColor}` : "",
    selectedSize ? `Size: ${selectedSize}` : "",
    "",
    "Please confirm availability and delivery details.",
  ];

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
