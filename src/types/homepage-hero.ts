export type HomepageHeroMode = "image" | "offer";
export type HomepageHeroOfferType = "percentage" | "fixed" | "sale-price";
export type HomepageHeroImagePosition = "left" | "center" | "right";

export type HomepageHeroCampaign = {
  id: string;
  mode: HomepageHeroMode;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imagePosition: HomepageHeroImagePosition;
  enabled: boolean;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  showCountdown: boolean;
  offerType: HomepageHeroOfferType;
  offerValue: number;
  offerBadge: string;
  createdAt?: string;
  updatedAt?: string;
};
