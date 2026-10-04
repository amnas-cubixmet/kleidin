import type { Announcement } from "@/types/announcement";
import { getSupabaseServerEnvironment } from "@/lib/server-env";

type DbAnnouncement = {
  id: string;
  text: string;
  link_label: string;
  link_href: string;
  starts_at: string | null;
  ends_at: string | null;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AnnouncementInput = {
  text: string;
  linkLabel?: string;
  linkHref?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  enabled?: boolean;
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
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

function fromDb(row: DbAnnouncement): Announcement {
  return {
    id: row.id,
    text: row.text,
    linkLabel: row.link_label,
    linkHref: row.link_href,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    enabled: row.enabled,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDb(input: AnnouncementInput) {
  return {
    text: input.text.trim(),
    link_label: input.linkLabel?.trim() ?? "",
    link_href: input.linkHref?.trim() ?? "",
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    enabled: input.enabled ?? true,
    sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 100,
    updated_at: new Date().toISOString(),
  };
}

export async function listAnnouncements() {
  const rows = await request<DbAnnouncement[]>(
    "/rest/v1/announcements?select=*&order=sort_order.asc,created_at.desc",
  );
  return rows.map(fromDb);
}

export async function listActiveAnnouncements() {
  const rows = await listAnnouncements();
  const now = Date.now();

  return rows.filter((item) => {
    if (!item.enabled) return false;
    if (item.startsAt && new Date(item.startsAt).getTime() > now) return false;
    if (item.endsAt && new Date(item.endsAt).getTime() < now) return false;
    return true;
  });
}

export async function createAnnouncement(input: AnnouncementInput) {
  const rows = await request<DbAnnouncement[]>("/rest/v1/announcements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(toDb(input)),
  });
  return fromDb(rows[0]);
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  const rows = await request<DbAnnouncement[]>(
    `/rest/v1/announcements?id=eq.${encodeURIComponent(id)}`,
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

export async function deleteAnnouncement(id: string) {
  await request<void>(
    `/rest/v1/announcements?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    },
  );
}
