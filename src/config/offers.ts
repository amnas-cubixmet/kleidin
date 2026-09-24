export const offerHero = {
  enabled: true,
  badge: "LIMITED TIME OFFER",
  titlePrefix: "FLAT",
  discount: "30%",
  titleSuffix: "OFF",
  description: "Upgrade your everyday wardrobe. Premium style for everyone.",
  ctaLabel: "Shop the Offer",
  ctaHref: "/products?new=1",
  duration: {
    days: 2,
    hours: 14,
    minutes: 36,
    seconds: 19,
  },
  image:
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1600&q=92",
  benefits: [
    {
      title: "Free Shipping",
      copy: "on orders over ₹1,999",
    },
    {
      title: "Easy Returns",
      copy: "7 days hassle free",
    },
    {
      title: "Premium Quality",
      copy: "Everyday essentials",
    },
  ],
} as const;
