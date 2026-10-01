import { store } from "@/config/store";
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

export function getProductWhatsappUrl(
  product: Product,
  whatsappNumber = store.whatsappNumber,
  selectedColor?: string,
  selectedSize?: string,
) {
  if (!whatsappNumber) return "#";

  const lines = [
    "Hi KLEID.IN, I would like to order this product:",
    "",
    product.name,
    `Price: ${formatPrice(product.price)}`,
    `Product: /products/${product.slug}`,
    selectedColor ? `Colour: ${selectedColor}` : "",
    selectedSize ? `Size: ${selectedSize}` : "",
    "",
    "Please confirm availability and delivery details.",
  ].filter(Boolean);

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    lines.join("\n"),
  )}`;
}


export function getWholesaleWhatsappUrl(
  whatsappNumber = store.whatsappNumber,
) {
  if (!whatsappNumber) return "#";

  const message = [
    "Hi KLEID.IN, I’m interested in wholesale / dealer ordering.",
    "",
    "Please share current wholesale pricing, minimum order requirements, available products, sizes and colours.",
  ].join("\n");

  return "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
}


export function getWholesaleProductWhatsappUrl(
  product: Product,
  whatsappNumber = store.whatsappNumber,
) {
  if (!whatsappNumber) return "#";

  const minOrder = product.wholesaleMinOrder ?? 12;
  const lines = [
    "Hi KLEID.IN, I’m interested in a dealer order for:",
    "",
    product.name,
    `Selling price: ${formatPrice(product.price)}`,
    `Minimum order: ${minOrder} pcs`,
    `Colours: ${product.colors.join(" / ")}`,
    `Product: /products/${product.slug}`,
    "",
    "Please share dealer pricing, current availability and delivery details.",
  ];

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
