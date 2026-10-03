"use client";

import { demoAdminHeroSlides } from "@/data/demo-admin-hero";
import type { HeroSlideConfig } from "@/data/hero-slides";

export const DEMO_ADMIN_HERO_STORAGE_KEY = "kleidin-demo-admin-hero-v1";
export const DEMO_ADMIN_HERO_UPDATED_EVENT = "kleidin:demo-hero-updated";

function cloneDefaults(): HeroSlideConfig[] {
  return demoAdminHeroSlides.map((slide) => ({ ...slide }));
}

export function readDemoAdminHero(): HeroSlideConfig[] {
  if (typeof window === "undefined") return cloneDefaults();

  try {
    const raw = window.localStorage.getItem(DEMO_ADMIN_HERO_STORAGE_KEY);
    if (!raw) return cloneDefaults();

    const parsed = JSON.parse(raw) as HeroSlideConfig[];
    return Array.isArray(parsed) ? parsed : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function writeDemoAdminHero(slides: HeroSlideConfig[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    DEMO_ADMIN_HERO_STORAGE_KEY,
    JSON.stringify(slides),
  );
  window.dispatchEvent(new Event(DEMO_ADMIN_HERO_UPDATED_EVENT));
}

export function resetDemoAdminHero() {
  writeDemoAdminHero(cloneDefaults());
}
