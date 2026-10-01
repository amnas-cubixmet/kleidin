import type { Testimonial } from "@/types/testimonial";

// Demo stories for local development / UI testing.
// Product photos are intentionally product-focused, not customer profile photos.
export const defaultTestimonials: Testimonial[] = [
  {
    id: "demo-core-heavy-tee",
    name: "Nihal K.",
    quote:
      "The fabric feels substantial without being too heavy. The fit is relaxed and the neck keeps its shape well.",
    location: "Kochi",
    productImage: "/images/hero/black-shirt.png",
    rating: 5,
    productSlug: "core-heavy-tee-black",
    showOnHome: true,
    enabled: true,
    createdAt: "2026-09-30T10:00:00.000Z",
  },
  {
    id: "demo-everyday-tee",
    name: "Arjun M.",
    quote:
      "Simple, clean and easy to wear. The white tee works with almost everything in my wardrobe.",
    location: "Thrissur",
    productImage:
      "https://images.unsplash.com/photo-1553787165-444e4356dff2?auto=format&fit=crop&w=1200&q=86",
    rating: 5,
    productSlug: "everyday-tee-white",
    showOnHome: true,
    enabled: true,
    createdAt: "2026-09-29T10:00:00.000Z",
  },
  {
    id: "demo-poplin-shirt",
    name: "Fahad R.",
    quote:
      "The shirt has a neat relaxed shape and still looks put together. Good everyday piece for work or weekends.",
    location: "Kozhikode",
    productImage:
      "https://images.unsplash.com/photo-1560885673-c18455b4e57e?auto=format&fit=crop&w=1200&q=86",
    rating: 4,
    productSlug: "relaxed-poplin-shirt-white",
    showOnHome: true,
    enabled: true,
    createdAt: "2026-09-28T10:00:00.000Z",
  },
  {
    id: "demo-utility-jacket",
    name: "Adil S.",
    quote:
      "The jacket feels structured but comfortable. I liked the clean finish and the easy layering.",
    location: "Bengaluru",
    productImage:
      "https://images.unsplash.com/photo-1545819697-286fcb772031?auto=format&fit=crop&w=1200&q=86",
    rating: 5,
    productSlug: "utility-jacket-black",
    showOnHome: true,
    enabled: true,
    createdAt: "2026-09-27T10:00:00.000Z",
  },
  {
    id: "demo-fine-crew-knit",
    name: "Riyas P.",
    quote:
      "Soft enough for all-day wear and the grey colour is easy to pair. The fit feels clean without being tight.",
    location: "Malappuram",
    productImage:
      "https://images.unsplash.com/photo-1563558055494-b76d54675e89?auto=format&fit=crop&w=1200&q=86",
    rating: 5,
    productSlug: "fine-crew-knit-heather-grey",
    showOnHome: true,
    enabled: true,
    createdAt: "2026-09-26T10:00:00.000Z",
  },
  {
    id: "demo-straight-trouser",
    name: "Shamil A.",
    quote:
      "The straight cut sits well and works with both tees and shirts. Comfortable for long days.",
    location: "Ernakulam",
    productImage:
      "https://images.unsplash.com/photo-1564041530925-e69f2031dd1a?auto=format&fit=crop&w=1200&q=86",
    rating: 4,
    productSlug: "straight-trouser-black",
    showOnHome: false,
    enabled: true,
    createdAt: "2026-09-25T10:00:00.000Z",
  },
];
