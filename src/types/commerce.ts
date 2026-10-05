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
  homeBrandEyebrow: string;
  homeBrandTitle: string;
  homeDealersEyebrow: string;
  homeDealersTitle: string;
  homeDealersBody: string;
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
