function readPublicEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

export const publicEnv = {
  whatsappNumber: readPublicEnv("NEXT_PUBLIC_WHATSAPP_NUMBER"),
  supportEmail:
    readPublicEnv("NEXT_PUBLIC_SUPPORT_EMAIL") || "hello@kleid.in",
  instagramUrl: readPublicEnv("NEXT_PUBLIC_INSTAGRAM_URL"),
  facebookUrl: readPublicEnv("NEXT_PUBLIC_FACEBOOK_URL"),
  announcementText:
    readPublicEnv("NEXT_PUBLIC_ANNOUNCEMENT_TEXT") ||
    "Free shipping on prepaid orders above ₹1,999",
  announcementLinkLabel:
    readPublicEnv("NEXT_PUBLIC_ANNOUNCEMENT_LINK_LABEL") ||
    "Shop the collection",
} as const;
