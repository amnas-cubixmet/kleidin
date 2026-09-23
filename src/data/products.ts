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
  },
  {
    id: "kl-004",
    sku: "KLD-TS-004",
    name: "Relaxed Tee — Stone",
    slug: "relaxed-tee-stone",
    category: "T-Shirts",
    price: 1499,
    description:
      "An easy relaxed-fit T-shirt in a versatile stone tone.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Stone"],
    stock: 0,
    featured: false,
    status: "sold-out",
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
