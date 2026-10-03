import type { Offer, StoreSettings } from "@/types/commerce";
import { publicEnv } from "@/lib/public-env";

export const localStoreSettings: StoreSettings = {
  whatsappNumber: publicEnv.whatsappNumber,
  announcementText: publicEnv.announcementText,
  announcementLinkLabel: publicEnv.announcementLinkLabel,
  instagramUrl: publicEnv.instagramUrl,
  facebookUrl: publicEnv.facebookUrl,
  supportEmail: publicEnv.supportEmail,
};

export const localOffers: Offer[] = [
  {
    id: "weekend-essentials",
    title: "Weekend Essentials",
    badge: "WEEKEND EDIT",
    discountText: "20%",
    description:
      "A limited selection of everyday tees, shirts and layers at special weekend pricing.",
    ctaLabel: "Shop the Edit",
    ctaHref: "/products?new=1",
    imageUrl:
      "https://images.unsplash.com/photo-1618200471414-0b01c7ad31f1?auto=format&fit=crop&w=1800&q=90",
    startsAt: "2026-09-27T00:00:00+05:30",
    endsAt: "2026-10-12T23:59:59+05:30",
    enabled: true,
    priority: 100,
  },
  {
    id: "new-season-core",
    title: "New Season Core",
    badge: "NEW SEASON",
    discountText: "15%",
    description:
      "Fresh core pieces for the next rotation, with clean silhouettes and easy everyday colour.",
    ctaLabel: "Explore New Arrivals",
    ctaHref: "/products?new=1",
    imageUrl:
      "https://images.unsplash.com/photo-1553787165-444e4356dff2?auto=format&fit=crop&w=1800&q=90",
    startsAt: "2026-09-27T00:00:00+05:30",
    endsAt: "2026-11-03T23:59:59+05:30",
    enabled: true,
    priority: 80,
  },
];
