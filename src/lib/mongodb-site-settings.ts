import type { StoreSettings } from "@/types/commerce";
import { localStoreSettings } from "@/data/store";
import { getMongoDatabase, isMongoDatabaseConfigured } from "@/lib/mongodb";

type StoreSettingsDocument = StoreSettings & {
  key: "storefront";
  updatedAt: string;
};

function clean(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalize(input: Partial<StoreSettings>): StoreSettings {
  const principles = Array.isArray(input.aboutPrinciples)
    ? input.aboutPrinciples
        .slice(0, 6)
        .map((item) => ({
          title: clean(item?.title),
          copy: clean(item?.copy),
        }))
        .filter((item) => item.title || item.copy)
    : localStoreSettings.aboutPrinciples;

  return {
    whatsappNumber: clean(input.whatsappNumber, localStoreSettings.whatsappNumber),
    instagramUrl: clean(input.instagramUrl, localStoreSettings.instagramUrl),
    facebookUrl: clean(input.facebookUrl, localStoreSettings.facebookUrl),
    supportEmail: clean(input.supportEmail, localStoreSettings.supportEmail),
    footerTagline: clean(input.footerTagline, localStoreSettings.footerTagline),
    homeBrandEyebrow: clean(input.homeBrandEyebrow, localStoreSettings.homeBrandEyebrow),
    homeBrandTitle: clean(input.homeBrandTitle, localStoreSettings.homeBrandTitle),
    homeDealersEyebrow: clean(input.homeDealersEyebrow, localStoreSettings.homeDealersEyebrow),
    homeDealersTitle: clean(input.homeDealersTitle, localStoreSettings.homeDealersTitle),
    homeDealersBody: clean(input.homeDealersBody, localStoreSettings.homeDealersBody),
    aboutHeroEyebrow: clean(input.aboutHeroEyebrow, localStoreSettings.aboutHeroEyebrow),
    aboutHeroTitle: clean(input.aboutHeroTitle, localStoreSettings.aboutHeroTitle),
    aboutHeroLead: clean(input.aboutHeroLead, localStoreSettings.aboutHeroLead),
    aboutHeroBody: clean(input.aboutHeroBody, localStoreSettings.aboutHeroBody),
    aboutMissionEyebrow: clean(input.aboutMissionEyebrow, localStoreSettings.aboutMissionEyebrow),
    aboutMissionTitle: clean(input.aboutMissionTitle, localStoreSettings.aboutMissionTitle),
    aboutMissionBody: clean(input.aboutMissionBody, localStoreSettings.aboutMissionBody),
    aboutPhilosophyEyebrow: clean(input.aboutPhilosophyEyebrow, localStoreSettings.aboutPhilosophyEyebrow),
    aboutPhilosophyTitle: clean(input.aboutPhilosophyTitle, localStoreSettings.aboutPhilosophyTitle),
    aboutPhilosophyBody: clean(input.aboutPhilosophyBody, localStoreSettings.aboutPhilosophyBody),
    aboutPrinciples:
      principles.length > 0 ? principles : localStoreSettings.aboutPrinciples,
    aboutBuiltEyebrow: clean(input.aboutBuiltEyebrow, localStoreSettings.aboutBuiltEyebrow),
    aboutBuiltTitle: clean(input.aboutBuiltTitle, localStoreSettings.aboutBuiltTitle),
    aboutBuiltBody: clean(input.aboutBuiltBody, localStoreSettings.aboutBuiltBody),
    aboutFutureEyebrow: clean(input.aboutFutureEyebrow, localStoreSettings.aboutFutureEyebrow),
    aboutFutureTitle: clean(input.aboutFutureTitle, localStoreSettings.aboutFutureTitle),
    aboutFutureBody: clean(input.aboutFutureBody, localStoreSettings.aboutFutureBody),
  };
}

export function isStoreSettingsDatabaseConfigured() {
  return isMongoDatabaseConfigured();
}

export async function getStoreSettingsFromDb(): Promise<StoreSettings> {
  if (!isMongoDatabaseConfigured()) return localStoreSettings;

  const db = await getMongoDatabase();
  const row = await db
    .collection<StoreSettingsDocument>("siteSettings")
    .findOne({ key: "storefront" });

  return row ? normalize(row) : localStoreSettings;
}

export async function saveStoreSettings(
  input: Partial<StoreSettings>,
): Promise<StoreSettings> {
  const db = await getMongoDatabase();
  const settings = normalize(input);

  await db.collection<StoreSettingsDocument>("siteSettings").updateOne(
    { key: "storefront" },
    {
      $set: {
        ...settings,
        key: "storefront",
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  return settings;
}
