import { getServerSupabase } from "@/lib/supabase/server";
import type { Offer, StoreSettings } from "@/types/commerce";

const fallbackSettings: StoreSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  announcementText: "New Drop Available",
  announcementLinkLabel: "Order on WhatsApp",
  instagramUrl: "",
  supportEmail: "",
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getServerSupabase();
  if (!supabase) return fallbackSettings;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return fallbackSettings;

  return {
    whatsappNumber: data.whatsapp_number ?? fallbackSettings.whatsappNumber,
    announcementText:
      data.announcement_text ?? fallbackSettings.announcementText,
    announcementLinkLabel:
      data.announcement_link_label ?? fallbackSettings.announcementLinkLabel,
    instagramUrl: data.instagram_url ?? "",
    supportEmail: data.support_email ?? "",
  };
}

export async function getActiveOffer(): Promise<Offer | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("enabled", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    badge: data.badge,
    discountText: data.discount_text,
    description: data.description,
    ctaLabel: data.cta_label,
    ctaHref: data.cta_href,
    imageUrl: data.image_url,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    enabled: data.enabled,
    priority: data.priority,
  };
}
