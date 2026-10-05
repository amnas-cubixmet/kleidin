import { cache } from "react";
import { getMongoEnvironment } from "@/lib/server-env";
import { listHeroSlides } from "@/lib/mongodb-hero";

export const getActiveHeroSlides = cache(async () => {
  if (!getMongoEnvironment()) return [];

  try {
    return await listHeroSlides({ enabledOnly: true });
  } catch {
    return [];
  }
});
