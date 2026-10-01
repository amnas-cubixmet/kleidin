import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "kld-ts-001",
    sku: "KLD-TS-001",
    name: "Core Heavy Tee — Black",
    slug: "core-heavy-tee-black",
    wholesaleSlug: "core-heavy-tee-dealer",
    category: "T-Shirts",
    price: 1490,
    compareAtPrice: 1790,
    saleEndsAt: "2026-10-12T23:59:59+05:30",
    saleLabel: "Limited offer",
    description:
      "240 GSM combed cotton T-shirt with a relaxed shoulder, clean rib neckline and a structured everyday drape. Designed as a dependable base layer for repeat wear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Blue"],
    colorVariants: [
      {
        name: "Black",
        value: "#111111",
        image: "/images/hero/black-shirt.png",
        stock: 18,
    wholesaleMinOrder: 12,
      },
      {
        name: "White",
        value: "#f4f4f0",
        image: "/images/hero/white-shirt.png",
        stock: 14,
      },
      {
        name: "Blue",
        value: "#3156a4",
        image: "/images/hero/blue-shirt.png",
        stock: 9,
      },
    ],
    stock: 18,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1499971442178-8c10fdf5f6ac?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 10,
  },
  {
    id: "kld-ts-002",
    sku: "KLD-TS-002",
    name: "Everyday Tee — White",
    slug: "everyday-tee-white",
    wholesaleSlug: "everyday-tee-dealer",
    category: "T-Shirts",
    price: 1290,
    description:
      "Soft cotton jersey T-shirt in a clean regular-relaxed fit. Lightweight enough for daily wear while keeping a neat shape through the body.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 24,
    wholesaleMinOrder: 12,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1553787165-444e4356dff2?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 20,
  },
  {
    id: "kld-sh-001",
    sku: "KLD-SH-001",
    name: "Relaxed Poplin Shirt — White",
    slug: "relaxed-poplin-shirt-white",
    wholesaleSlug: "relaxed-poplin-shirt-dealer",
    category: "Shirts",
    price: 2390,
    compareAtPrice: 2690,
    description:
      "A crisp cotton poplin shirt with a softened collar, relaxed body and curved hem. Easy enough for casual wear and clean enough for sharper styling.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 12,
    wholesaleMinOrder: 8,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1560885673-c18455b4e57e?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 30,
  },
  {
    id: "kld-ow-001",
    sku: "KLD-OW-001",
    name: "Utility Jacket — Black",
    slug: "utility-jacket-black",
    wholesaleSlug: "utility-jacket-dealer",
    category: "Outerwear",
    price: 3490,
    compareAtPrice: 3890,
    description:
      "A lightweight black outer layer with a clean utility silhouette. Built to sit comfortably over tees and shirts without adding unnecessary bulk.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    stock: 7,
    wholesaleMinOrder: 6,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1545819697-286fcb772031?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 40,
  },
  {
    id: "kld-kn-001",
    sku: "KLD-KN-001",
    name: "Fine Crew Knit — Heather Grey",
    slug: "fine-crew-knit-heather-grey",
    wholesaleSlug: "fine-crew-knit-dealer",
    category: "Knitwear",
    price: 2790,
    description:
      "Fine-gauge crew-neck knit with a soft hand feel and clean rib finish. A polished mid-layer for cooler days, office wear and evening dressing.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Heather Grey"],
    stock: 9,
    wholesaleMinOrder: 8,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1563558055494-b76d54675e89?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 50,
  },
  {
    id: "kld-bt-001",
    sku: "KLD-BT-001",
    name: "Straight Trouser — Black",
    slug: "straight-trouser-black",
    wholesaleSlug: "straight-trouser-dealer",
    category: "Bottoms",
    price: 2490,
    description:
      "Straight-leg trouser with a clean front, comfortable rise and versatile black finish. Cut to work with tees, shirts and lightweight outerwear.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black"],
    stock: 15,
    wholesaleMinOrder: 8,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1564041530925-e69f2031dd1a?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 60,
  },
  {
    id: "kld-ac-001",
    sku: "KLD-AC-001",
    name: "Everyday Cap — Black",
    slug: "everyday-cap-black",
    wholesaleSlug: "everyday-cap-dealer",
    category: "Accessories",
    price: 990,
    description:
      "Low-profile everyday cap with an adjustable back closure and clean tonal finish. An easy final layer for casual styling.",
    sizes: ["One Size"],
    colors: ["Black"],
    stock: 21,
    wholesaleMinOrder: 12,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1550314124-301ca0b773ae?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 70,
  },
  {
    id: "kld-ac-002",
    sku: "KLD-AC-002",
    name: "Canvas Carry Tote — Natural",
    slug: "canvas-carry-tote-natural",
    wholesaleSlug: "canvas-carry-tote-dealer",
    category: "Accessories",
    price: 890,
    description:
      "Reusable cotton-canvas tote with a roomy everyday shape and reinforced carry handles. Made for daily essentials, books and light shopping.",
    sizes: ["One Size"],
    colors: ["Natural"],
    stock: 26,
    wholesaleMinOrder: 12,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1772890753143-24991d807710?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 80,
  },
];

export function getActiveProducts() {
  return products
    .filter((product) => product.status !== "draft")
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

export function getProductBySlug(slug: string) {
  return products.find(
    (product) => product.slug === slug && product.status !== "draft",
  );
}


export function getProductByWholesaleSlug(slug: string) {
  return products.find(
    (product) =>
      (product.wholesaleSlug ?? `${product.slug}-dealer`) === slug &&
      product.status !== "draft",
  );
}
