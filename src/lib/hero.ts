import { cache } from "react";
import { heroSlides } from "@/data/hero-slides";
import { getMongoEnvironment } from "@/lib/server-env";
import { listHeroSlides } from "@/lib/mongodb-hero";

export const getActiveHeroSlides = cache(async () => {
  if (!getMongoEnvironment()) return heroSlides.filter((slide) => slide.enabled);

  try {
    const slides = await listHeroSlides({ enabledOnly: true });
    return slides.length ? slides : heroSlides.filter((slide) => slide.enabled);
  } catch {
    return heroSlides.filter((slide) => slide.enabled);
  }
});
