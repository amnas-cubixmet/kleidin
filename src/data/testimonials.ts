import type { Testimonial } from "@/types/testimonial";

// Demo testimonials for local development / UI testing.
// Replace, edit or hide them from Admin when real customer feedback is available.
export const defaultTestimonials: Testimonial[] = [
  {
    id: "demo-core-heavy-tee",
    name: "Nihal K.",
    quote:
      "The fabric feels substantial without being too heavy. The fit is relaxed and the neck keeps its shape well.",
    location: "Demo · Kochi",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
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
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
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
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
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
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    rating: 5,
    productSlug: "utility-jacket-black",
    showOnHome: false,
    enabled: true,
    createdAt: "2026-09-27T10:00:00.000Z",
  },
  {
    id: "demo-fine-crew-knit",
    name: "Riyas P.",
    quote:
      "Soft enough for all-day wear and the grey colour is easy to pair. The fit feels clean without being tight.",
    location: "Demo · Malappuram",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
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
    location: "Demo · Ernakulam",
    image:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=240&q=80",
    rating: 4,
    productSlug: "straight-trouser-black",
    showOnHome: false,
    enabled: true,
    createdAt: "2026-09-25T10:00:00.000Z",
  },
  {
    id: "demo-everyday-cap",
    name: "Aswin J.",
    quote:
      "Minimal branding and a good everyday shape. Easy to wear without overthinking the outfit.",
    location: "Demo · Palakkad",
    rating: 5,
    productSlug: "everyday-cap-black",
    showOnHome: false,
    enabled: true,
    createdAt: "2026-09-24T10:00:00.000Z",
  },
  {
    id: "demo-canvas-tote",
    name: "Nabeel T.",
    quote:
      "The tote is simple, useful and feels sturdy enough for everyday carry.",
    location: "Demo · Kannur",
    rating: 5,
    productSlug: "canvas-carry-tote-natural",
    showOnHome: false,
    enabled: true,
    createdAt: "2026-09-23T10:00:00.000Z",
  },
];
