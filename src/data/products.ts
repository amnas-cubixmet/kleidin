import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "kl-001",
    sku: "KLD-TS-001",
    name: "Essential Tee — Black",
    slug: "essential-tee-black",
    category: "T-Shirts",
    price: 1299,
    compareAtPrice: 1599,
    description:
      "A clean everyday T-shirt with a relaxed silhouette and soft hand feel.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    stock: 24,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: "kl-002",
    sku: "KLD-TS-002",
    name: "Essential Tee — White",
    slug: "essential-tee-white",
    category: "T-Shirts",
    price: 1299,
    compareAtPrice: 1599,
    description:
      "A minimal white everyday T-shirt designed for easy layering and repeat wear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 18,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: "kl-003",
    sku: "KLD-TS-003",
    name: "Heavyweight Tee — Graphite",
    slug: "heavyweight-tee-graphite",
    category: "T-Shirts",
    price: 1699,
    description:
      "A structured heavyweight T-shirt with a premium drape and substantial feel.",
    sizes: ["M", "L", "XL"],
    colors: ["Graphite"],
    stock: 12,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: "kl-004",
    sku: "KLD-SH-001",
    name: "Everyday Shirt — Sky",
    slug: "everyday-shirt-sky",
    category: "Shirts",
    price: 2199,
    description:
      "An easy long-sleeve shirt with a clean collar and relaxed everyday proportion.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sky Blue"],
    stock: 14,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: "kl-005",
    sku: "KLD-OS-001",
    name: "Utility Overshirt — Navy",
    slug: "utility-overshirt-navy",
    category: "Overshirts",
    price: 2799,
    description:
      "A lightweight overshirt built for layering over tees and shirts.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy"],
    stock: 9,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: "kl-006",
    sku: "KLD-SH-002",
    name: "Relaxed Shirt — White",
    slug: "relaxed-shirt-white",
    category: "Shirts",
    price: 1999,
    description:
      "A versatile white shirt with a relaxed body and clean minimal finish.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 20,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: "kl-007",
    sku: "KLD-TS-004",
    name: "Relaxed Tee — Stone",
    slug: "relaxed-tee-stone",
    category: "T-Shirts",
    price: 1499,
    description:
      "An easy relaxed-fit T-shirt in a versatile stone tone.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Stone"],
    stock: 16,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: "kl-008",
    sku: "KLD-OS-002",
    name: "Core Overshirt — Black",
    slug: "core-overshirt-black",
    category: "Overshirts",
    price: 2899,
    description:
      "A black overshirt with clean pockets and an easy straight fit.",
    sizes: ["M", "L", "XL"],
    colors: ["Black"],
    stock: 7,
    featured: true,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=88",
  },
];

export function getActiveProducts() {
  return products.filter((product) => product.status !== "draft");
}

export function getFeaturedProducts() {
  return products.filter(
    (product) => product.featured && product.status === "active",
  );
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
