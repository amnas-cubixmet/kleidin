import { defaultTestimonials } from "@/data/testimonials";
import type { Testimonial } from "@/types/testimonial";

export const TESTIMONIAL_STORAGE_KEY = "kleidin-testimonials-v2";
export const TESTIMONIAL_UPDATED_EVENT = "kleidin:testimonials-updated";

export function readTestimonials(): Testimonial[] {
  if (typeof window === "undefined") return defaultTestimonials;

  try {
    const raw = window.localStorage.getItem(TESTIMONIAL_STORAGE_KEY);
    if (!raw) return defaultTestimonials;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultTestimonials;
  } catch {
    return defaultTestimonials;
  }
}

export function writeTestimonials(items: Testimonial[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TESTIMONIAL_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(TESTIMONIAL_UPDATED_EVENT));
}
