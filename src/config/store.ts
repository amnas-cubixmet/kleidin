export const store = {
  name: "KLEID.IN",
  description:
    "Modern everyday clothing built around clean silhouettes, useful colours and repeat wear.",
  currency: "INR",
  locale: "en-IN",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
} as const;
