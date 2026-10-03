import type { Product } from "@/types/product";

export function isProductOfferActive(product: Product, now = Date.now()) {
  if (!product.offerEnabled || !product.offerValue) return false;

  const starts = product.offerStartsAt
    ? new Date(product.offerStartsAt).getTime()
    : null;
  const ends = product.offerEndsAt
    ? new Date(product.offerEndsAt).getTime()
    : null;

  if (starts !== null && Number.isFinite(starts) && now < starts) return false;
  if (ends !== null && Number.isFinite(ends) && now > ends) return false;
  return true;
}

export function getProductOfferPrice(product: Product, now = Date.now()) {
  if (!isProductOfferActive(product, now)) return product.price;

  const value = Math.max(0, Number(product.offerValue ?? 0));

  if (product.offerType === "percentage") {
    return Math.max(0, Math.round(product.price * (1 - value / 100)));
  }

  if (product.offerType === "fixed") {
    return Math.max(0, product.price - value);
  }

  return Math.max(0, Math.min(product.price, value));
}

export function getProductOfferStatus(product: Product, now = Date.now()) {
  if (!product.offerEnabled) return "off" as const;

  const starts = product.offerStartsAt
    ? new Date(product.offerStartsAt).getTime()
    : null;
  const ends = product.offerEndsAt
    ? new Date(product.offerEndsAt).getTime()
    : null;

  if (starts !== null && Number.isFinite(starts) && now < starts) {
    return "scheduled" as const;
  }

  if (ends !== null && Number.isFinite(ends) && now > ends) {
    return "expired" as const;
  }

  return "active" as const;
}
