import type { Testimonial } from "@/types/testimonial";

// Demo stories for local development / UI testing.
// Product photos are intentionally product-focused, not customer profile photos.
export const defaultTestimonials: Testimonial[] = [
  {
    id: "demo-pending-tee-review",
    name: "Rahil T.",
    quote:
      "The washed black tee feels premium and the fit is exactly what I wanted. I would size down only if you prefer a closer fit.",
    location: "Kochi",
    productImage:
      "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1200&q=86",
    rating: 5,
    productSlug: "core-heavy-tee-washed-black",
    showOnHome: false,
    enabled: false,
    pending: true,
    submittedByCustomer: true,
    createdAt: "2026-10-03T14:10:00.000Z",
  },
  {
    id: "demo-pending-shirt-review",
    name: "Shan P.",
    quote:
      "The white oxford is clean enough for work but still relaxed. Fabric feels better than I expected for the price.",
    location: "Thrissur",
    productImage:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=86",
    rating: 4,
    productSlug: "relaxed-oxford-shirt-white",
    showOnHome: false,
    enabled: false,
    pending: true,
    submittedByCustomer: true,
    createdAt: "2026-10-03T09:20:00.000Z",
  },
  {
    id: "demo-hidden-review",
    name: "Afsal K.",
    quote:
      "Good fit and colour. Delivery took a little longer than expected, but the product itself is solid.",
    location: "Kannur",
    rating: 4,
    productSlug: "daily-tee-cobalt",
    showOnHome: false,
    enabled: false,
    pending: false,
    submittedByCustomer: true,
    createdAt: "2026-10-01T11:40:00.000Z",
  },
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
