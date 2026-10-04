import type { Testimonial } from "@/types/testimonial";
import { getSupabaseServerEnvironment } from "@/lib/server-env";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

type DbTestimonial = {
  id: string;
  name: string;
  quote: string;
  location: string | null;
  product_image_url: string | null;
  product_image_public_id: string | null;
  rating: number;
  product_slug: string | null;
  show_on_home: boolean;
  enabled: boolean;
  pending: boolean;
  submitted_by_customer: boolean;
  created_at: string;
  updated_at: string;
};

export type TestimonialCreateInput = {
  name: string;
  quote: string;
  location?: string;
  rating: number;
  productSlug?: string;
  productImage?: string;
  productImagePublicId?: string;
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

function fromDb(row: DbTestimonial): Testimonial {
  return {
    id: row.id,
    name: row.name,
    quote: row.quote,
    location: row.location ?? undefined,
    productImage: row.product_image_url ?? undefined,
    productImagePublicId: row.product_image_public_id ?? undefined,
    rating: Number(row.rating),
    productSlug: row.product_slug ?? undefined,
    showOnHome: row.show_on_home,
    enabled: row.enabled,
    pending: row.pending,
    submittedByCustomer: row.submitted_by_customer,
    createdAt: row.created_at,
  };
}

export async function listPublishedTestimonials(productSlug?: string) {
  const filter = productSlug
    ? `&product_slug=eq.${encodeURIComponent(productSlug)}`
    : "&show_on_home=eq.true";

  const rows = await request<DbTestimonial[]>(
    `/rest/v1/testimonials?select=*&enabled=eq.true&pending=eq.false${filter}&order=created_at.desc`,
  );
  return rows.map(fromDb);
}

export async function listAllTestimonials() {
  const rows = await request<DbTestimonial[]>(
    "/rest/v1/testimonials?select=*&order=created_at.desc",
  );
  return rows.map(fromDb);
}

export async function createTestimonial(input: TestimonialCreateInput) {
  const rows = await request<DbTestimonial[]>("/rest/v1/testimonials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: input.name,
      quote: input.quote,
      location: input.location || null,
      product_image_url: input.productImage || null,
      product_image_public_id: input.productImagePublicId || null,
      rating: input.rating,
      product_slug: input.productSlug || null,
      show_on_home: !input.productSlug,
      enabled: false,
      pending: true,
      submitted_by_customer: true,
      updated_at: new Date().toISOString(),
    }),
  });

  return fromDb(rows[0]);
}

export async function updateTestimonialModeration(
  id: string,
  values: { enabled: boolean; pending: boolean },
) {
  const rows = await request<DbTestimonial[]>(
    `/rest/v1/testimonials?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        enabled: values.enabled,
        pending: values.pending,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  return rows[0] ? fromDb(rows[0]) : null;
}

export async function deleteTestimonial(id: string) {
  const rows = await request<DbTestimonial[]>(
    `/rest/v1/testimonials?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
  );
  const row = rows[0];

  await request<void>(
    `/rest/v1/testimonials?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    },
  );

  if (row?.product_image_public_id) {
    try {
      await deleteCloudinaryImage(row.product_image_public_id);
    } catch (error) {
      console.error("Review deleted but Cloudinary cleanup failed:", error);
    }
  }
}
