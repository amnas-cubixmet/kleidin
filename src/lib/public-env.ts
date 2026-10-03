export const publicEnv = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "hello@kleid.in",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() ?? "",
  announcementText:
    process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT?.trim() ||
    "Free shipping on prepaid orders above ₹1,999",
  announcementLinkLabel:
    process.env.NEXT_PUBLIC_ANNOUNCEMENT_LINK_LABEL?.trim() ||
    "Shop the collection",
} as const;
