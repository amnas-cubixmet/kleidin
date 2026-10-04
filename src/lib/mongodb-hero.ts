import type {
  HeroSlideConfig,
} from "@/data/hero-slides";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import {
  getMongoDatabase,
  isMongoDatabaseConfigured,
} from "@/lib/mongodb";

export type HeroSlideWriteInput = Omit<HeroSlideConfig, "id"> & {
  isDemo?: boolean;
};

type HeroSlideDocument = HeroSlideConfig & {
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
};

function toHero(doc: HeroSlideDocument): HeroSlideConfig {
  return {
    id: doc.id,
    kind: doc.kind,
    productId: doc.productId,
    label: doc.label,
    title: doc.title,
    subtitle: doc.subtitle,
    button: doc.button,
    href: doc.href,
    badge: doc.badge,
    discountText: doc.discountText,
    imageUrl: doc.imageUrl,
    imagePublicId: doc.imagePublicId,
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
    showCountdown: doc.showCountdown,
    ctaStyle: doc.ctaStyle,
    imagePosition: doc.imagePosition,
    enabled: doc.enabled,
    order: doc.order,
  };
}

export function isHeroDatabaseConfigured() {
  return isMongoDatabaseConfigured();
}

export async function listHeroSlides(options?: {
  enabledOnly?: boolean;
  fallbackDefaults?: boolean;
}) {
  if (!isHeroDatabaseConfigured()) return [];

  const db = await getMongoDatabase();
  const filter = options?.enabledOnly ? { enabled: true } : {};

  const rows = await db
    .collection<HeroSlideDocument>("heroSlides")
    .find(filter)
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  return rows.map(toHero);
}

export async function createHeroSlide(input: HeroSlideWriteInput) {
  const db = await getMongoDatabase();
  const now = new Date().toISOString();

  const document: HeroSlideDocument = {
    id: crypto.randomUUID(),
    kind: input.kind,
    productId: input.productId,
    label: input.label,
    title: input.title,
    subtitle: input.subtitle,
    button: input.button,
    href: input.href,
    badge: input.badge,
    discountText: input.discountText,
    imageUrl: input.imageUrl,
    imagePublicId: input.imagePublicId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    showCountdown: input.showCountdown,
    ctaStyle: input.ctaStyle,
    imagePosition: input.imagePosition,
    enabled: input.enabled,
    order: input.order,
    createdAt: now,
    updatedAt: now,
    isDemo: input.isDemo ?? false,
  };

  await db.collection<HeroSlideDocument>("heroSlides").insertOne(document);
  return toHero(document);
}

export async function updateHeroSlide(
  id: string,
  input: HeroSlideWriteInput,
) {
  const db = await getMongoDatabase();
  const collection = db.collection<HeroSlideDocument>("heroSlides");
  const existing = await collection.findOne({ id });
  if (!existing) return null;

  const document: HeroSlideDocument = {
    ...existing,
    ...input,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    isDemo: input.isDemo ?? existing.isDemo ?? false,
  };

  await collection.replaceOne({ id }, document);
  return toHero(document);
}

export async function getHeroSlide(id: string) {
  const db = await getMongoDatabase();
  const row = await db
    .collection<HeroSlideDocument>("heroSlides")
    .findOne({ id });

  return row ? toHero(row) : null;
}

export async function deleteHeroSlide(id: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<HeroSlideDocument>("heroSlides");
  const row = await collection.findOne({ id });

  await collection.deleteOne({ id });

  if (row?.imagePublicId) {
    try {
      await deleteCloudinaryImage(row.imagePublicId);
    } catch (error) {
      console.error("Hero deleted but Cloudinary cleanup failed:", error);
    }
  }
}

export async function deleteDemoHeroSlides() {
  const db = await getMongoDatabase();
  return db
    .collection<HeroSlideDocument>("heroSlides")
    .deleteMany({ isDemo: true });
}
