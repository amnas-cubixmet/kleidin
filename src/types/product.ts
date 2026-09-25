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
  tryOnImage?: string;
  sortOrder?: number;
};

export type DbProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  status: ProductStatus;
  image_url: string | null;
  try_on_image_url: string | null;
  sort_order: number;
};
