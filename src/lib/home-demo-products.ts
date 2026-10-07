import type { Product } from "@/types/product";

export const homeDemoProducts: Product[] = [
  {
    id: "demo-1",
    sku: "DEMO-TEE-001",
    name: "Essential White Tee",
    slug: "essential-white-tee",
    category: "T-Shirts",
    price: 799,
    description:
      "A clean everyday essential with a balanced weight, relaxed structure and an easy fit built for repeat wear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 24,
    featured: true,
    status: "active",
    image: "/images/product-1.png",
  },
  {
    id: "demo-2",
    sku: "DEMO-TEE-002",
    name: "Daily White Tee",
    slug: "daily-white-tee",
    category: "T-Shirts",
    price: 899,
    description:
      "Soft, minimal and versatile. Designed with a comfortable silhouette and a clean finish for everyday styling.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 18,
    featured: true,
    status: "active",
    image: "/images/product-2.png",
  },
  {
    id: "demo-3",
    sku: "DEMO-TEE-003",
    name: "Relaxed Essential Tee",
    slug: "relaxed-essential-tee",
    category: "T-Shirts",
    price: 849,
    description:
      "An easy relaxed tee with a clean silhouette, everyday comfort and a simple finish.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 20,
    featured: false,
    status: "active",
    image: "/images/product-1.png",
  },
  {
    id: "demo-4",
    sku: "DEMO-TEE-004",
    name: "Everyday Tee",
    slug: "everyday-tee",
    category: "T-Shirts",
    price: 899,
    description:
      "A minimal daily tee designed for easy styling, repeat wear and a comfortable everyday fit.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 16,
    featured: false,
    status: "active",
    image: "/images/product-2.png",
  },
];

export function getHomeDemoProductBySlug(slug: string) {
  return homeDemoProducts.find((product) => product.slug === slug);
}
