import "server-only";

import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/mongodb";
import type {
  HomepageHeroCampaign,
  HomepageHeroImagePosition,
  HomepageHeroMode,
  HomepageHeroOfferType,
} from "@/types/homepage-hero";

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function bool(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mode(value: unknown): HomepageHeroMode {
  return value === "offer" ? "offer" : "image";
}

function offerType(value: unknown): HomepageHeroOfferType {
  return value === "fixed" || value === "sale-price"
    ? value
    : "percentage";
}

function imagePosition(value: unknown): HomepageHeroImagePosition {
  return value === "left" || value === "right" ? value : "center";
}

function iso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return text(value) || undefined;
}

function toCampaign(doc: Record<string, unknown>): HomepageHeroCampaign {
  return {
    id: text(doc.id),
    mode: mode(doc.mode),
    eyebrow: text(doc.eyebrow),
    title: text(doc.title),
    subtitle: text(doc.subtitle),
    buttonLabel: text(doc.buttonLabel),
    buttonHref: text(doc.buttonHref),
    imageUrl: text(doc.imageUrl),
    imagePosition: imagePosition(doc.imagePosition),
    enabled: bool(doc.enabled, true),
    priority: number(doc.priority),
    startsAt: text(doc.startsAt) || null,
    endsAt: text(doc.endsAt) || null,
    showCountdown: bool(doc.showCountdown),
    offerType: offerType(doc.offerType),
    offerValue: number(doc.offerValue),
    offerBadge: text(doc.offerBadge),
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

function fields(
  input: Record<string, unknown>,
  current?: HomepageHeroCampaign,
) {
  return {
    mode: input.mode !== undefined ? mode(input.mode) : current?.mode ?? "image",
    eyebrow: text(input.eyebrow, current?.eyebrow),
    title: text(input.title, current?.title),
    subtitle: text(input.subtitle, current?.subtitle),
    buttonLabel: text(input.buttonLabel, current?.buttonLabel),
    buttonHref: text(input.buttonHref, current?.buttonHref),
    imageUrl: text(input.imageUrl, current?.imageUrl),
    imagePosition:
      input.imagePosition !== undefined
        ? imagePosition(input.imagePosition)
        : current?.imagePosition ?? "center",
    enabled:
      typeof input.enabled === "boolean"
        ? input.enabled
        : current?.enabled ?? true,
    priority:
      input.priority !== undefined
        ? number(input.priority)
        : current?.priority ?? 0,
    startsAt: text(input.startsAt, current?.startsAt ?? "") || null,
    endsAt: text(input.endsAt, current?.endsAt ?? "") || null,
    showCountdown:
      typeof input.showCountdown === "boolean"
        ? input.showCountdown
        : current?.showCountdown ?? false,
    offerType:
      input.offerType !== undefined
        ? offerType(input.offerType)
        : current?.offerType ?? "percentage",
    offerValue:
      input.offerValue !== undefined
        ? number(input.offerValue)
        : current?.offerValue ?? 0,
    offerBadge: text(input.offerBadge, current?.offerBadge),
  };
}

export async function listHomepageHeroCampaigns(options?: {
  enabledOnly?: boolean;
}) {
  const db = await getDb();
  const rows = await db
    .collection("homepageHeroCampaigns")
    .find(options?.enabledOnly ? { enabled: true } : {})
    .sort({ priority: 1, updatedAt: 1 })
    .toArray();

  return rows.map((row) =>
    toCampaign(row as unknown as Record<string, unknown>),
  );
}

export async function getHomepageHeroCampaign(id: string) {
  const db = await getDb();
  const row = await db.collection("homepageHeroCampaigns").findOne({ id });
  return row
    ? toCampaign(row as unknown as Record<string, unknown>)
    : null;
}

export async function createHomepageHeroCampaign(
  input: Record<string, unknown>,
) {
  const db = await getDb();
  const now = new Date();
  const id = randomUUID();

  await db.collection("homepageHeroCampaigns").insertOne({
    id,
    ...fields(input),
    createdAt: now,
    updatedAt: now,
  });

  return getHomepageHeroCampaign(id);
}

export async function updateHomepageHeroCampaign(
  id: string,
  input: Record<string, unknown>,
) {
  const current = await getHomepageHeroCampaign(id);
  if (!current) return null;

  const db = await getDb();
  await db.collection("homepageHeroCampaigns").updateOne(
    { id },
    {
      $set: {
        ...fields(input, current),
        updatedAt: new Date(),
      },
    },
  );

  return getHomepageHeroCampaign(id);
}

export async function deleteHomepageHeroCampaign(id: string) {
  const db = await getDb();
  const result = await db.collection("homepageHeroCampaigns").deleteOne({ id });
  return result.deletedCount === 1;
}
