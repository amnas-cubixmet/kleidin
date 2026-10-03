import type { Product } from "@/types/product";

export const demoAdminProducts: Product[] = [
  {
    id: "demo-core-heavy-tee",
    sku: "KLD-TS-101",
    name: "Core Heavy Tee — Washed Black",
    slug: "core-heavy-tee-washed-black",
    wholesaleSlug: "core-heavy-tee-washed-black-dealer",
    category: "T-Shirts",
    price: 1490,
    compareAtPrice: 1790,
    wholesaleEnabled: true,
    wholesalePrice: 990,
    wholesaleMinOrder: 12,
    description:
      "240 GSM cotton tee with a relaxed shoulder, clean neckline and washed black finish. Built for repeat everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Black", "White", "Cobalt Blue"],
    colorVariants: [
      {
        name: "Washed Black",
        value: "#171717",
        stock: 8,
        image:
          "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=88",
        ],
      },
      {
        name: "White",
        value: "#f4f4f0",
        stock: 6,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88",
        ],
      },
      {
        name: "Cobalt Blue",
        value: "#3156a4",
        stock: 4,
        image:
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 18,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 10,
  },
  {
    id: "demo-box-fit-tee",
    sku: "KLD-TS-102",
    name: "Box Fit Tee — Bone",
    slug: "box-fit-tee-bone",
    wholesaleSlug: "box-fit-tee-bone-dealer",
    category: "T-Shirts",
    price: 1390,
    wholesaleEnabled: true,
    wholesalePrice: 920,
    wholesaleMinOrder: 12,
    description:
      "Soft heavyweight cotton with a slightly cropped box fit and minimal finish.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Bone"],
    colorVariants: [
      {
        name: "Bone",
        value: "#ddd8ce",
        stock: 22,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 22,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 20,
  },
  {
    id: "demo-daily-tee",
    sku: "KLD-TS-103",
    name: "Daily Tee — Cobalt",
    slug: "daily-tee-cobalt",
    category: "T-Shirts",
    price: 1290,
    compareAtPrice: 1490,
    wholesaleEnabled: false,
    description:
      "Everyday cotton jersey tee in KLEID.IN cobalt with a straight relaxed fit.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cobalt Blue"],
    colorVariants: [
      {
        name: "Cobalt Blue",
        value: "#3156a4",
        stock: 4,
        image:
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 4,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 30,
  },
  {
    id: "demo-oxford-shirt",
    sku: "KLD-SH-201",
    name: "Relaxed Oxford Shirt — White",
    slug: "relaxed-oxford-shirt-white",
    wholesaleSlug: "relaxed-oxford-shirt-white-dealer",
    category: "Shirts",
    price: 2290,
    compareAtPrice: 2590,
    wholesaleEnabled: true,
    wholesalePrice: 1590,
    wholesaleMinOrder: 8,
    description:
      "A clean oxford shirt with a relaxed body, soft collar and easy everyday structure.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    colorVariants: [
      {
        name: "White",
        value: "#f4f4f0",
        stock: 13,
        image:
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 13,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 40,
  },
  {
    id: "demo-resort-shirt",
    sku: "KLD-SH-202",
    name: "Resort Shirt — Slate",
    slug: "resort-shirt-slate",
    category: "Shirts",
    price: 2190,
    wholesaleEnabled: false,
    description:
      "Lightweight open-collar shirt designed for warm days and clean layered styling.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Slate"],
    colorVariants: [
      {
        name: "Slate",
        value: "#59636f",
        stock: 7,
        image:
          "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 7,
    featured: false,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 50,
  },
  {
    id: "demo-overshirt",
    sku: "KLD-OS-301",
    name: "Utility Overshirt — Midnight",
    slug: "utility-overshirt-midnight",
    wholesaleSlug: "utility-overshirt-midnight-dealer",
    category: "Overshirts",
    price: 2990,
    compareAtPrice: 3390,
    wholesaleEnabled: true,
    wholesalePrice: 2090,
    wholesaleMinOrder: 6,
    description:
      "Midweight overshirt with utility pockets, matte hardware and a straight relaxed fit.",
    sizes: ["M", "L", "XL"],
    colors: ["Midnight Navy"],
    colorVariants: [
      {
        name: "Midnight Navy",
        value: "#182238",
        stock: 3,
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 3,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 60,
  },
  {
    id: "demo-trouser",
    sku: "KLD-BT-501",
    name: "Relaxed Trouser — Black",
    slug: "relaxed-trouser-black",
    category: "Bottoms",
    price: 2590,
    wholesaleEnabled: false,
    description:
      "Straight relaxed trouser with a clean front, soft drape and everyday comfort.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black"],
    colorVariants: [
      {
        name: "Black",
        value: "#111111",
        stock: 15,
        image:
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 15,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 70,
  },
  {
    id: "demo-logo-cap",
    sku: "KLD-AC-601",
    name: "Logo Cap — Black",
    slug: "logo-cap-black",
    category: "Accessories",
    price: 990,
    wholesaleEnabled: false,
    description:
      "Six-panel cotton cap with subtle KLEID.IN branding and an adjustable back strap.",
    sizes: ["One Size"],
    colors: ["Black"],
    colorVariants: [
      {
        name: "Black",
        value: "#111111",
        stock: 0,
        image:
          "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1400&q=88",
        images: [
          "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1400&q=88",
        ],
      },
    ],
    stock: 0,
    featured: false,
    status: "sold-out",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1400&q=88",
    sortOrder: 80,
  },
];

export function getDemoAdminProduct(id: string) {
  return demoAdminProducts.find((product) => product.id === id) ?? null;
}
