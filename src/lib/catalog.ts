import { products as fallbackProducts } from "@/data/products";
import { getServerSupabase } from "@/lib/supabase/server";
import type { DbProduct, Product } from "@/types/product";

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    description: row.description,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    stock: row.stock,
    featured: row.featured,
    status: row.status,
    image: row.image_url ?? undefined,
    tryOnImage: row.try_on_image_url ?? undefined,
    sortOrder: row.sort_order,
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  const supabase = getServerSupabase();

  if (!supabase) {
    return [...fallbackProducts].sort(
      (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999),
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("status", "draft")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return [...fallbackProducts].sort(
      (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999),
    );
  }

  return (data as DbProduct[]).map(mapProduct);
}

export async function getCatalogProductBySlug(slug: string) {
  const supabase = getServerSupabase();

  if (!supabase) {
    return fallbackProducts.find((product) => product.slug === slug);
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .neq("status", "draft")
    .maybeSingle();

  if (error || !data) {
    return fallbackProducts.find((product) => product.slug === slug);
  }

  return mapProduct(data as DbProduct);
}
