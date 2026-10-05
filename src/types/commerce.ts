export type AboutPrinciple = {
  title: string;
  copy: string;
};

export type StoreSettings = {
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  supportEmail: string;
  footerTagline: string;
  homeCatalogEyebrow: string;
  homeCatalogTitle: string;
  homeBrandEyebrow: string;
  homeBrandTitle: string;
  homeAboutButtonLabel: string;
  homeDealersEyebrow: string;
  homeDealersTitle: string;
  homeDealersBody: string;
  homeDealersButtonLabel: string;
  homeDealerTags: string[];
  homeSpotlightBadge: string;
  homeTestimonialsEyebrow: string;
  homeTestimonialsTitle: string;
  aboutHeroEyebrow: string;
  aboutHeroTitle: string;
  aboutHeroLead: string;
  aboutHeroBody: string;
  aboutMissionEyebrow: string;
  aboutMissionTitle: string;
  aboutMissionBody: string;
  aboutPhilosophyEyebrow: string;
  aboutPhilosophyTitle: string;
  aboutPhilosophyBody: string;
  aboutPrinciples: AboutPrinciple[];
  aboutBuiltEyebrow: string;
  aboutBuiltTitle: string;
  aboutBuiltBody: string;
  aboutFutureEyebrow: string;
  aboutFutureTitle: string;
  aboutFutureBody: string;
  aboutShopButtonLabel: string;
  aboutWhatsappButtonLabel: string;
};

export type Offer = {
  id: string;
  title: string;
  badge: string;
  discountText: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  enabled: boolean;
  priority: number;
};
