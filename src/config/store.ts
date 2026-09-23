export const store = {
  name: "KLEID.IN",
  description: "Modern essentials. Clean forms. Everyday wear.",
  currency: "INR",
  locale: "en-IN",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
} as const;
