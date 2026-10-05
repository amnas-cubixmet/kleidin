import type { Announcement } from "@/types/announcement";
import { getMongoDatabase } from "@/lib/mongodb";

export type AnnouncementInput = {
  text: string;
  linkLabel?: string;
  linkHref?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  enabled?: boolean;
  sortOrder?: number;
};

type AnnouncementDocument = Announcement & {
  isDemo?: boolean;
};

function toAnnouncement(doc: AnnouncementDocument): Announcement {
  return {
    id: doc.id,
    text: doc.text,
    linkLabel: doc.linkLabel,
    linkHref: doc.linkHref,
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
    enabled: doc.enabled,
    sortOrder: doc.sortOrder,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listAnnouncements() {
  const db = await getMongoDatabase();
  const rows = await db
    .collection<AnnouncementDocument>("announcements")
    .find({ isDemo: { $ne: true } })
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  return rows.map(toAnnouncement);
}

export async function listActiveAnnouncements() {
  const db = await getMongoDatabase();
  const rows = await db
    .collection<AnnouncementDocument>("announcements")
    .find({ isDemo: { $ne: true }, enabled: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  const now = Date.now();

  return rows
    .filter((item) => {
      if (!item.enabled) return false;
      if (item.startsAt && new Date(item.startsAt).getTime() > now) return false;
      if (item.endsAt && new Date(item.endsAt).getTime() < now) return false;
      return true;
    })
    .map(toAnnouncement);
}

export async function createAnnouncement(input: AnnouncementInput) {
  const db = await getMongoDatabase();
  const now = new Date().toISOString();

  const document: AnnouncementDocument = {
    id: crypto.randomUUID(),
    text: input.text.trim(),
    linkLabel: input.linkLabel?.trim() ?? "",
    linkHref: input.linkHref?.trim() ?? "",
    startsAt: input.startsAt || null,
    endsAt: input.endsAt || null,
    enabled: input.enabled ?? true,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder! : 100,
    createdAt: now,
    updatedAt: now,
  };

  await db
    .collection<AnnouncementDocument>("announcements")
    .insertOne(document);

  return toAnnouncement(document);
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
) {
  const db = await getMongoDatabase();
  const collection = db.collection<AnnouncementDocument>("announcements");
  const existing = await collection.findOne({ id, isDemo: { $ne: true } });
  if (!existing) return null;

  const document: AnnouncementDocument = {
    ...existing,
    id,
    text: input.text.trim(),
    linkLabel: input.linkLabel?.trim() ?? "",
    linkHref: input.linkHref?.trim() ?? "",
    startsAt: input.startsAt || null,
    endsAt: input.endsAt || null,
    enabled: input.enabled ?? true,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder! : 100,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await collection.replaceOne({ id, isDemo: { $ne: true } }, document);
  return toAnnouncement(document);
}

export async function deleteAnnouncement(id: string) {
  const db = await getMongoDatabase();
  await db.collection<AnnouncementDocument>("announcements").deleteOne({ id, isDemo: { $ne: true } });
}

