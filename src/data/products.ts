import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "kld-ts-101",
    sku: "KLD-TS-101",
    name: "Core Heavy Tee — Washed Black",
    slug: "core-heavy-tee-washed-black",
    category: "T-Shirts",
    price: 1490,
    compareAtPrice: 1790,
    description:
      "240 GSM cotton tee with a relaxed shoulder, clean neckline and washed black finish. Built for everyday rotation.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Black"],
    stock: 18,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 10,
  },
  {
    id: "kld-ts-102",
    sku: "KLD-TS-102",
    name: "Box Fit Tee — Bone",
    slug: "box-fit-tee-bone",
    category: "T-Shirts",
    price: 1390,
    description:
      "Soft heavyweight cotton with a slightly cropped box fit and minimal finish.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Bone"],
    stock: 22,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 20,
  },
  {
    id: "kld-ts-103",
    sku: "KLD-TS-103",
    name: "Daily Tee — Cobalt",
    slug: "daily-tee-cobalt",
    category: "T-Shirts",
    price: 1290,
    compareAtPrice: 1490,
    description:
      "Everyday cotton jersey tee in KLEID.IN cobalt with a straight relaxed fit.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cobalt Blue"],
    stock: 11,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 30,
  },
  {
    id: "kld-sh-201",
    sku: "KLD-SH-201",
    name: "Relaxed Oxford Shirt — White",
    slug: "relaxed-oxford-shirt-white",
    category: "Shirts",
    price: 2290,
    compareAtPrice: 2590,
    description:
      "A clean oxford shirt with a relaxed body, soft collar and easy everyday structure.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 13,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 40,
  },
  {
    id: "kld-sh-202",
    sku: "KLD-SH-202",
    name: "Resort Shirt — Slate",
    slug: "resort-shirt-slate",
    category: "Shirts",
    price: 2190,
    description:
      "Lightweight open-collar shirt designed for warm days and clean layered styling.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Slate"],
    stock: 9,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 50,
  },
  {
    id: "kld-os-301",
    sku: "KLD-OS-301",
    name: "Utility Overshirt — Midnight",
    slug: "utility-overshirt-midnight",
    category: "Overshirts",
    price: 2990,
    compareAtPrice: 3390,
    description:
      "Midweight overshirt with utility pockets, matte hardware and a straight relaxed fit.",
    sizes: ["M", "L", "XL"],
    colors: ["Midnight Navy"],
    stock: 7,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 60,
  },
  {
    id: "kld-os-302",
    sku: "KLD-OS-302",
    name: "Work Overshirt — Sand",
    slug: "work-overshirt-sand",
    category: "Overshirts",
    price: 2890,
    description:
      "A clean workwear-inspired outer layer in a soft sand tone, made for easy layering.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sand"],
    stock: 6,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 70,
  },
  {
    id: "kld-kn-401",
    sku: "KLD-KN-401",
    name: "Essential Knit — Charcoal",
    slug: "essential-knit-charcoal",
    category: "Knitwear",
    price: 2490,
    compareAtPrice: 2890,
    description:
      "Soft fine-gauge knit with a minimal crew neck and clean ribbed finish.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal"],
    stock: 8,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 80,
  },
  {
    id: "kld-bt-501",
    sku: "KLD-BT-501",
    name: "Relaxed Trouser — Black",
    slug: "relaxed-trouser-black",
    category: "Bottoms",
    price: 2590,
    description:
      "Straight relaxed trouser with a clean front, soft drape and everyday comfort.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black"],
    stock: 15,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 90,
  },
  {
    id: "kld-bt-502",
    sku: "KLD-BT-502",
    name: "Everyday Trouser — Stone",
    slug: "everyday-trouser-stone",
    category: "Bottoms",
    price: 2490,
    compareAtPrice: 2790,
    description:
      "Minimal straight-leg trouser with a soft stone finish and easy waist construction.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Stone"],
    stock: 10,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 100,
  },
  {
    id: "kld-ac-601",
    sku: "KLD-AC-601",
    name: "Logo Cap — Black",
    slug: "logo-cap-black",
    category: "Accessories",
    price: 990,
    description:
      "Six-panel cotton cap with subtle KLEID.IN branding and adjustable back strap.",
    sizes: ["One Size"],
    colors: ["Black"],
    stock: 24,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 110,
  },
  {
    id: "kld-ac-602",
    sku: "KLD-AC-602",
    name: "Canvas Tote — Natural",
    slug: "canvas-tote-natural",
    category: "Accessories",
    price: 790,
    description:
      "Heavy canvas everyday tote with a minimal front mark and reinforced handles.",
    sizes: ["One Size"],
    colors: ["Natural"],
    stock: 19,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1400&q=90",
    sortOrder: 120,
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
