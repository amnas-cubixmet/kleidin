export type ProductStatus = "active" | "draft" | "sold-out";

export type ProductColorVariant = {
  name: string;
  value: string;
  image: string;
  stock?: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  wholesaleSlug?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  saleEndsAt?: string;
  saleLabel?: string;
  description: string;
  sizes: string[];
  colors: string[];
  colorVariants?: ProductColorVariant[];
  stock: number;
  wholesaleMinOrder?: number;
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
  wholesale_slug?: string | null;
  category: string;
  price: number;
  compare_at_price: number | null;
  sale_ends_at?: string | null;
  sale_label?: string | null;
  description: string;
  sizes: string[];
  colors: string[];
  color_variants?: ProductColorVariant[] | null;
  stock: number;
  wholesale_min_order?: number | null;
  featured: boolean;
  status: ProductStatus;
  image_url: string | null;
  try_on_image_url: string | null;
  sort_order: number;
};
