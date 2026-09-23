export type ProductStatus = "active" | "draft" | "sold-out";

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  status: ProductStatus;
  image?: string;
};
