import {
  defaultHeroSlides,
  type HeroCtaStyle,
  type HeroImagePosition,
  type HeroSlideConfig,
  type HeroSlideKind,
} from "@/data/hero-slides";
import { getSupabaseServerEnvironment } from "@/lib/server-env";

type DbHeroSlide = {
  id: string;
  kind: HeroSlideKind;
  product_id: string | null;
  label: string;
  title: string;
  subtitle: string;
  button_text: string;
  cta_href: string;
  badge: string;
  discount_text: string;
  image_url: string;
  starts_at: string | null;
  ends_at: string | null;
  show_countdown: boolean;
  cta_style: HeroCtaStyle;
  image_position: HeroImagePosition;
  enabled: boolean;
  sort_order: number;
};

export type HeroSlideWriteInput = Omit<HeroSlideConfig, "id">;

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

function fromDb(row: DbHeroSlide): HeroSlideConfig {
  return {
    id: row.id,
    kind: row.kind,
    productId: row.product_id,
    label: row.label,
    title: row.title,
    subtitle: row.subtitle,
    button: row.button_text,
    href: row.cta_href,
    badge: row.badge,
    discountText: row.discount_text,
    imageUrl: row.image_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    showCountdown: row.show_countdown,
    ctaStyle: row.cta_style,
    imagePosition: row.image_position,
    enabled: row.enabled,
    order: row.sort_order,
  };
}

function toDb(input: HeroSlideWriteInput) {
  return {
    kind: input.kind,
    product_id: input.productId || null,
    label: input.label,
    title: input.title,
    subtitle: input.subtitle,
    button_text: input.button,
    cta_href: input.href,
    badge: input.badge,
    discount_text: input.discountText ?? "",
    image_url: input.imageUrl,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    show_countdown: Boolean(input.showCountdown),
    cta_style: input.ctaStyle ?? "light",
    image_position: input.imagePosition ?? "center",
    enabled: input.enabled,
    sort_order: input.order,
    updated_at: new Date().toISOString(),
  };
}

export function isHeroDatabaseConfigured() {
  return getSupabaseServerEnvironment() !== null;
}

export async function listHeroSlides(options?: { enabledOnly?: boolean; fallbackDefaults?: boolean }) {
  if (!isHeroDatabaseConfigured()) return defaultHeroSlides;

  const enabled = options?.enabledOnly ? "&enabled=eq.true" : "";
  const rows = await request<DbHeroSlide[]>(
    `/rest/v1/hero_slides?select=*&order=sort_order.asc,created_at.asc${enabled}`,
  );

  if (rows.length) return rows.map(fromDb);
  return options?.fallbackDefaults === false ? [] : defaultHeroSlides;
}

export async function createHeroSlide(input: HeroSlideWriteInput) {
  const rows = await request<DbHeroSlide[]>("/rest/v1/hero_slides", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(toDb(input)),
  });

  return fromDb(rows[0]);
}

export async function updateHeroSlide(
  id: string,
  input: HeroSlideWriteInput,
) {
  const rows = await request<DbHeroSlide[]>(
    `/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(toDb(input)),
    },
  );

  return rows[0] ? fromDb(rows[0]) : null;
}

export async function deleteHeroSlide(id: string) {
  await request<void>(
    `/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    },
  );
}
