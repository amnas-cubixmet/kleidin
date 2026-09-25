import { localOffers, localStoreSettings } from "@/data/store";

export async function getStoreSettings() {
  return localStoreSettings;
}

export async function getActiveOffers() {
  return localOffers
    .filter((offer) => offer.enabled)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}
