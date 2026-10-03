import type { DbProduct, Product, ProductColorVariant, ProductOfferType, ProductStatus } from "@/types/product";
import { getSupabaseServerEnvironment } from "@/lib/server-env";

export type ProductWriteInput = {
  id?: string;
  sku: string;
  name: string;
  slug: string;
  wholesaleSlug?: string | null;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  offerEnabled?: boolean;
  offerType?: ProductOfferType;
  offerValue?: number | null;
  offerLabel?: string | null;
  offerBadge?: string | null;
  offerStartsAt?: string | null;
  offerEndsAt?: string | null;
  offerCountdown?: boolean;
  wholesaleEnabled: boolean;
  wholesalePrice?: number | null;
  wholesaleMinOrder?: number | null;
  description: string;
  sizes: string[];
  colors: string[];
  colorVariants: ProductColorVariant[];
  stock: number;
  featured: boolean;
  status: ProductStatus;
  image?: string | null;
  tryOnImage?: string | null;
  sortOrder?: number;
};

function headers(extra?: HeadersInit) {
  const env = getSupabaseServerEnvironment();
  if (!env) throw new Error("Supabase is not configured.");

  return {
    apikey: env.serviceRoleKey,
    Authorization: `Bearer ${env.serviceRoleKey}`,
    ...extra,
  };
}

function dbToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    wholesaleSlug: row.wholesale_slug ?? undefined,
    category: row.category,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ?? undefined,
    offerEnabled: Boolean(row.offer_enabled),
    offerType: row.offer_type ?? "sale-price",
    offerValue: row.offer_value ?? undefined,
    offerLabel: row.offer_label ?? undefined,
    offerBadge: row.offer_badge ?? undefined,
    offerStartsAt: row.offer_starts_at ?? undefined,
    offerEndsAt: row.offer_ends_at ?? undefined,
    offerCountdown: Boolean(row.offer_countdown),
    saleEndsAt: row.offer_ends_at ?? undefined,
    saleLabel: row.offer_label ?? undefined,
    wholesaleEnabled: Boolean(row.wholesale_enabled),
    wholesalePrice: row.wholesale_price ?? undefined,
    wholesaleMinOrder: row.wholesale_min_order ?? undefined,
    description: row.description,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    colorVariants: row.color_variants ?? [],
    stock: Number(row.stock ?? 0),
    featured: Boolean(row.featured),
    status: row.status,
    image: row.image_url ?? undefined,
    tryOnImage: row.try_on_image_url ?? undefined,
    sortOrder: row.sort_order ?? 100,
  };
}

function productToDb(input: ProductWriteInput) {
  return {
    ...(input.id ? { id: input.id } : {}),
    sku: input.sku,
    name: input.name,
    slug: input.slug,
    wholesale_slug: input.wholesaleEnabled
      ? input.wholesaleSlug || `${input.slug}-dealer`
      : null,
    category: input.category,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    offer_enabled: Boolean(input.offerEnabled),
    offer_type: input.offerType ?? "sale-price",
    offer_value: input.offerEnabled ? input.offerValue ?? null : null,
    offer_label: input.offerEnabled ? input.offerLabel ?? "" : "",
    offer_badge: input.offerEnabled ? input.offerBadge ?? "" : "",
    offer_starts_at: input.offerEnabled ? input.offerStartsAt ?? null : null,
    offer_ends_at: input.offerEnabled ? input.offerEndsAt ?? null : null,
    offer_countdown: input.offerEnabled ? Boolean(input.offerCountdown) : false,
    wholesale_enabled: input.wholesaleEnabled,
    wholesale_price: input.wholesaleEnabled ? input.wholesalePrice ?? null : null,
    wholesale_min_order: input.wholesaleEnabled ? input.wholesaleMinOrder ?? null : null,
    description: input.description,
    sizes: input.sizes,
    colors: input.colors,
    color_variants: input.colorVariants,
    stock: input.stock,
    featured: input.featured,
    status: input.status,
    image_url: input.image ?? null,
    try_on_image_url: input.tryOnImage ?? null,
    sort_order: input.sortOrder ?? 100,
    updated_at: new Date().toISOString(),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const env = getSupabaseServerEnvironment();
  if (!env) throw new Error("Supabase is not configured.");

  const response = await fetch(`${env.url}${path}`, {
    ...init,
    headers: headers(init?.headers),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function isProductDatabaseConfigured() {
  return getSupabaseServerEnvironment() !== null;
}

export async function listProducts(options?: { activeOnly?: boolean }) {
  const filter = options?.activeOnly ? "&status=neq.draft" : "";
  const rows = await request<DbProduct[]>(
    `/rest/v1/products?select=*&order=sort_order.asc,created_at.desc${filter}`,
  );
  return rows.map(dbToProduct);
}

export async function getProduct(id: string) {
  const rows = await request<DbProduct[]>(
    `/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
  );
  return rows[0] ? dbToProduct(rows[0]) : null;
}

export async function getProductBySlugFromDb(slug: string) {
  const rows = await request<DbProduct[]>(
    `/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&status=neq.draft&select=*&limit=1`,
  );
  return rows[0] ? dbToProduct(rows[0]) : null;
}

export async function getWholesaleProductBySlugFromDb(slug: string) {
  const rows = await request<DbProduct[]>(
    `/rest/v1/products?wholesale_slug=eq.${encodeURIComponent(slug)}&wholesale_enabled=eq.true&status=neq.draft&select=*&limit=1`,
  );
  return rows[0] ? dbToProduct(rows[0]) : null;
}

export async function createProduct(input: ProductWriteInput) {
  const rows = await request<DbProduct[]>("/rest/v1/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(productToDb(input)),
  });
  return dbToProduct(rows[0]);
}

export async function updateProduct(id: string, input: ProductWriteInput) {
  const rows = await request<DbProduct[]>(
    `/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(productToDb({ ...input, id: undefined })),
    },
  );
  return rows[0] ? dbToProduct(rows[0]) : null;
}

export function collectProductStoragePaths(product: Product) {
  const env = getSupabaseServerEnvironment();
  if (!env) return [] as string[];
  const prefix = `${env.url}/storage/v1/object/public/products/`;
  const urls = [
    product.image,
    product.tryOnImage,
    ...(product.colorVariants ?? []).flatMap((variant) => [
      variant.image,
      ...(variant.images ?? []),
    ]),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(urls)]
    .filter((url) => url.startsWith(prefix))
    .map((url) => decodeURIComponent(url.slice(prefix.length)));
}

export async function deleteStorageObjects(paths: string[]) {
  if (!paths.length) return;
  const env = getSupabaseServerEnvironment();
  if (!env) throw new Error("Supabase is not configured.");

  const response = await fetch(`${env.url}/storage/v1/object/products`, {
    method: "DELETE",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: paths }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Could not delete product images.");
  }
}

export async function deleteProduct(id: string) {
  const product = await getProduct(id);
  if (!product) return false;

  const paths = collectProductStoragePaths(product);
  await request<void>(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });

  if (paths.length) {
    try {
      await deleteStorageObjects(paths);
    } catch (error) {
      console.error("Product deleted but storage cleanup failed:", error);
    }
  }

  return true;
}

export async function uploadProductImage(
  path: string,
  bytes: ArrayBuffer,
  contentType: string,
) {
  const env = getSupabaseServerEnvironment();
  if (!env) throw new Error("Supabase is not configured.");

  const safePath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  const response = await fetch(
    `${env.url}/storage/v1/object/products/${safePath}`,
    {
      method: "POST",
      headers: headers({
        "Content-Type": contentType,
        "x-upsert": "true",
      }),
      body: bytes,
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Image upload failed.");
  }

  return {
    path,
    url: `${env.url}/storage/v1/object/public/products/${path
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/")}`,
  };
}
