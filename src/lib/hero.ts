import { cache } from "react";
import { getMongoEnvironment } from "@/lib/server-env";
import { listHeroSlides } from "@/lib/mongodb-hero";
import type { HeroSlideConfig } from "@/data/hero-slides";
import type { Product } from "@/types/product";

export const getActiveHeroSlides = cache(async () => {
  if (!getMongoEnvironment()) return [];

  return listHeroSlides({ enabledOnly: true });
});

export function isHeroSlideLive(slide: HeroSlideConfig, now = Date.now()) {
  if (!slide.enabled) return false;

  const startsAt = slide.startsAt
    ? new Date(slide.startsAt).getTime()
    : null;
  const endsAt = slide.endsAt ? new Date(slide.endsAt).getTime() : null;

  if (startsAt !== null && Number.isFinite(startsAt) && now < startsAt) {
    return false;
  }

  if (endsAt !== null && Number.isFinite(endsAt) && now >= endsAt) {
    return false;
  }

  return true;
}

export function getActiveGlobalOffer(
  slides: HeroSlideConfig[],
  now = Date.now(),
) {
  return [...slides]
    .filter(
      (slide) =>
        slide.kind === "offer" &&
        isHeroSlideLive(slide, now) &&
        Number(slide.offerValue ?? 0) > 0,
    )
    .sort((a, b) => a.order - b.order)[0] ?? null;
}

export function applyGlobalOffer(
  product: Product,
  offer: HeroSlideConfig | null,
): Product {
  if (!offer) return product;

  return {
    ...product,
    offerEnabled: true,
    offerType: offer.offerType ?? "percentage",
    offerValue: Number(offer.offerValue ?? 0),
    offerLabel:
      offer.discountText || offer.label || offer.title || "Store offer",
    offerBadge: offer.badge || offer.discountText || "Offer",
    offerStartsAt: offer.startsAt ?? undefined,
    offerEndsAt: offer.endsAt ?? undefined,
    offerCountdown: Boolean(offer.showCountdown && offer.endsAt),
  };
}
