import { getServerSupabase } from "@/lib/supabase/server";
import type { Offer, StoreSettings } from "@/types/commerce";

const emptySettings: StoreSettings = {
  whatsappNumber: "",
  announcementText: "",
  announcementLinkLabel: "",
  instagramUrl: "",
  supportEmail: "",
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getServerSupabase();
  if (!supabase) return emptySettings;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return emptySettings;

  return {
    whatsappNumber: data.whatsapp_number ?? "",
    announcementText: data.announcement_text ?? "",
    announcementLinkLabel: data.announcement_link_label ?? "",
    instagramUrl: data.instagram_url ?? "",
    supportEmail: data.support_email ?? "",
  };
}

export async function getActiveOffers(): Promise<Offer[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("enabled", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    badge: row.badge,
    discountText: row.discount_text,
    description: row.description,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    imageUrl: row.image_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    enabled: row.enabled,
    priority: row.priority,
  }));
}
