import { cache } from "react";
import { getMongoEnvironment } from "@/lib/server-env";
import { listHomepageHeroCampaigns } from "@/lib/mongodb-homepage-hero";
import type { HomepageHeroCampaign } from "@/types/homepage-hero";
import type { Product } from "@/types/product";

export const getHomepageHeroCampaigns = cache(async () => {
  if (!getMongoEnvironment()) return [];
  return listHomepageHeroCampaigns({ enabledOnly: true });
});

export function isHomepageHeroLive(
  campaign: HomepageHeroCampaign,
  now = Date.now(),
) {
  if (!campaign.enabled) return false;

  const starts = campaign.startsAt
    ? new Date(campaign.startsAt).getTime()
    : null;
  const ends = campaign.endsAt ? new Date(campaign.endsAt).getTime() : null;

  if (starts !== null && Number.isFinite(starts) && now < starts) return false;
  if (ends !== null && Number.isFinite(ends) && now >= ends) return false;

  return true;
}

export function getActiveHomepageOffer(
  campaigns: HomepageHeroCampaign[],
  now = Date.now(),
) {
  return [...campaigns]
    .filter(
      (campaign) =>
        campaign.mode === "offer" &&
        isHomepageHeroLive(campaign, now) &&
        campaign.offerValue > 0,
    )
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return (
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
      );
    })[0] ?? null;
}

export function applyHomepageOffer(
  product: Product,
  campaign: HomepageHeroCampaign | null,
): Product {
  if (!campaign) return product;

  const requested = Math.max(0, Number(campaign.offerValue || 0));
  const value =
    campaign.offerType === "percentage"
      ? Math.min(requested, 100)
      : Math.min(requested, product.price);

  return {
    ...product,
    offerEnabled: true,
    offerType: campaign.offerType,
    offerValue: value,
    offerLabel: campaign.offerBadge || campaign.eyebrow || campaign.title,
    offerBadge: campaign.offerBadge || "Offer",
    offerStartsAt: campaign.startsAt ?? undefined,
    offerEndsAt: campaign.endsAt ?? undefined,
    offerCountdown: Boolean(campaign.showCountdown && campaign.endsAt),
  };
}
