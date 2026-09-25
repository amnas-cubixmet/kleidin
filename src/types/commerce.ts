export type StoreSettings = {
  whatsappNumber: string;
  announcementText: string;
  announcementLinkLabel: string;
  instagramUrl: string;
  supportEmail: string;
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
