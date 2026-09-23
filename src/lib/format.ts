import { store } from "@/config/store";

export function formatPrice(value: number) {
  return new Intl.NumberFormat(store.locale, {
    style: "currency",
    currency: store.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getWhatsappUrl(productName?: string) {
  if (!store.whatsappNumber) return "#";

  const message = productName
    ? `Hi, I want to order ${productName} from KLEID.IN.`
    : "Hi, I want to know more about KLEID.IN products.";

  return `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
