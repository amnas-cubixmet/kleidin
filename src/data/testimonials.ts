import type { Testimonial } from "@/types/testimonial";

// Demo testimonials for local development / UI testing.
// Replace or hide these from Admin when real customer feedback is available.
export const defaultTestimonials: Testimonial[] = [
  {
    id: "demo-core-heavy-tee",
    name: "Nihal K.",
    quote:
      "The fabric feels substantial without being too heavy. The fit is relaxed and the neck keeps its shape well.",
    location: "Demo · Kochi",
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
    location: "Demo · Thrissur",
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
    location: "Demo · Kozhikode",
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
    location: "Demo · Bengaluru",
    rating: 5,
    productSlug: "utility-jacket-black",
    showOnHome: false,
    enabled: true,
    createdAt: "2026-09-27T10:00:00.000Z",
  },
];
