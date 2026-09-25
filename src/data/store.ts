import type { Offer, StoreSettings } from "@/types/commerce";

export const localStoreSettings: StoreSettings = {
  whatsappNumber: "",
  announcementText: "Free shipping on orders above ₹1,999",
  announcementLinkLabel: "Shop now",
  instagramUrl: "",
  supportEmail: "",
};

export const localOffers: Offer[] = [
  {
    id: "weekend-edit",
    title: "Weekend Edit",
    badge: "WEEKEND OFFER",
    discountText: "20%",
    description: "Selected everyday essentials at a limited-time price.",
    ctaLabel: "Shop the Edit",
    ctaHref: "/products?new=1",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=92",
    startsAt: null,
    endsAt: "2026-12-31T23:59:59+05:30",
    enabled: true,
    priority: 100,
  },
  {
    id: "new-season",
    title: "New Season",
    badge: "NEW SEASON",
    discountText: "15%",
    description: "Fresh layers and clean essentials for the new rotation.",
    ctaLabel: "Explore New Arrivals",
    ctaHref: "/products?new=1",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=92",
    startsAt: null,
    endsAt: "2026-11-30T23:59:59+05:30",
    enabled: true,
    priority: 80,
  },
];
