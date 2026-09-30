"use client";

import { useMemo, useState } from "react";
import {
  defaultHeroSlides,
  HERO_SLIDE_STORAGE_KEY,
  type HeroSlideConfig,
} from "@/data/hero-slides";

function readInitialSlides() {
  if (typeof window === "undefined") return defaultHeroSlides;

  try {
    const saved = window.localStorage.getItem(HERO_SLIDE_STORAGE_KEY);
    if (!saved) return defaultHeroSlides;

    const parsed = JSON.parse(saved) as HeroSlideConfig[];
    if (!Array.isArray(parsed)) return defaultHeroSlides;

    const savedById = new Map(parsed.map((item) => [item.id, item]));
    return defaultHeroSlides.map((item) => ({
      ...item,
      ...(savedById.get(item.id) ?? {}),
    }));
  } catch {
    return defaultHeroSlides;
  }
}

export function AdminHeroManager() {
  const [slides, setSlides] = useState<HeroSlideConfig[]>(readInitialSlides);
  const [selectedId, setSelectedId] = useState(slides[0]?.id ?? "");
  const [saved, setSaved] = useState(false);

  const ordered = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides],
  );

  const selected =
    slides.find((slide) => slide.id === selectedId) ?? ordered[0];

  function updateSlide(patch: Partial<HeroSlideConfig>) {
    if (!selected) return;

    setSaved(false);
    setSlides((current) =>
      current.map((slide) =>
        slide.id === selected.id ? { ...slide, ...patch } : slide,
      ),
    );
  }

  function moveSelected(direction: -1 | 1) {
    if (!selected) return;

    const list = [...ordered];
    const index = list.findIndex((item) => item.id === selected.id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;

    const other = list[nextIndex];
    const selectedOrder = selected.order;

    setSaved(false);
    setSlides((current) =>
      current.map((item) => {
        if (item.id === selected.id) return { ...item, order: other.order };
        if (item.id === other.id) return { ...item, order: selectedOrder };
        return item;
      }),
    );
  }

  function save() {
    window.localStorage.setItem(HERO_SLIDE_STORAGE_KEY, JSON.stringify(slides));
    setSaved(true);
  }

  function reset() {
    window.localStorage.removeItem(HERO_SLIDE_STORAGE_KEY);
    setSlides(defaultHeroSlides);
    setSelectedId(defaultHeroSlides[0]?.id ?? "");
    setSaved(false);
  }

  if (!selected) return null;

  const fieldClass =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[13px] text-[#111] outline-none transition focus:border-[#001cac]";

  return (
    <section className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="rounded-[22px] border border-black/8 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,.04)]">
        <div className="flex items-center justify-between px-2 pb-3 pt-1">
          <div>
            <p className="m-0 text-[9px] font-semibold tracking-[.14em] text-[#001cac]">
              HERO MANAGER
            </p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-.03em]">
              {slides.filter((slide) => slide.enabled).length} active slides
            </h2>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-black/10 px-3 py-2 text-[9px] font-semibold"
          >
            Reset
          </button>
        </div>

        <div className="space-y-1.5">
          {ordered.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setSelectedId(slide.id)}
              className={
                "flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition " +
                (selected.id === slide.id
                  ? "bg-[#001cac] text-white"
                  : "bg-[#f7f7f5] text-[#111] hover:bg-[#efefec]")
              }
            >
              <span className="w-7 shrink-0 text-[9px] font-semibold opacity-60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-[11px] font-semibold">
                  {slide.title}
                </strong>
                <span className="mt-1 block truncate text-[8px] opacity-60">
                  {slide.label}
                </span>
              </span>
              <span
                className={
                  "size-2 shrink-0 rounded-full " +
                  (slide.enabled ? "bg-[#46d47c]" : "bg-black/20")
                }
              />
            </button>
          ))}
        </div>
      </aside>

      <div className="rounded-[22px] border border-black/8 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,.04)] md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/8 pb-5">
          <div>
            <p className="m-0 text-[9px] font-semibold tracking-[.14em] text-[#001cac]">
              EDIT SLIDE
            </p>
            <h2 className="mt-1 text-[28px] font-semibold tracking-[-.045em]">
              {selected.title}
            </h2>
            <p className="mt-1 text-[10px] text-black/45">{selected.id}</p>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-3 py-2">
            <input
              type="checkbox"
              checked={selected.enabled}
              onChange={(event) =>
                updateSlide({ enabled: event.target.checked })
              }
              className="accent-[#001cac]"
            />
            <span className="text-[10px] font-semibold">
              {selected.enabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        <div className="grid gap-4 py-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[.08em] text-black/45">
              Label
            </span>
            <input
              value={selected.label}
              onChange={(event) => updateSlide({ label: event.target.value })}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[.08em] text-black/45">
              Badge
            </span>
            <input
              value={selected.badge}
              onChange={(event) => updateSlide({ badge: event.target.value })}
              className={fieldClass}
              placeholder="Auto when blank"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[.08em] text-black/45">
              Title
            </span>
            <input
              value={selected.title}
              onChange={(event) => updateSlide({ title: event.target.value })}
              className={fieldClass}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[.08em] text-black/45">
              Subtitle
            </span>
            <textarea
              value={selected.subtitle}
              onChange={(event) =>
                updateSlide({ subtitle: event.target.value })
              }
              rows={3}
              className={fieldClass + " resize-none"}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[.08em] text-black/45">
              Button text
            </span>
            <input
              value={selected.button}
              onChange={(event) => updateSlide({ button: event.target.value })}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[.08em] text-black/45">
              CTA link
            </span>
            <input
              value={selected.href}
              onChange={(event) => updateSlide({ href: event.target.value })}
              className={fieldClass}
              placeholder="Leave blank for automatic product/contact link"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[.08em] text-black/45">
              Custom image URL
            </span>
            <input
              value={selected.imageUrl}
              onChange={(event) =>
                updateSlide({ imageUrl: event.target.value })
              }
              className={fieldClass}
              placeholder="Leave blank to use the automatic product/offer image"
            />
          </label>
        </div>

        <div className="rounded-[18px] bg-[#071225] p-5 text-white">
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#7395ff]">
            {selected.label}
          </p>
          <h3 className="mt-3 max-w-[760px] text-[clamp(34px,6vw,72px)] font-semibold leading-[.88] tracking-[-.055em]">
            {selected.title}
          </h3>
          <p className="mt-3 max-w-[520px] text-[11px] leading-5 text-white/60">
            {selected.subtitle}
          </p>
          <span className="mt-5 inline-flex min-h-10 items-center rounded-full bg-white px-4 text-[9px] font-semibold text-[#111]">
            {selected.button}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => moveSelected(-1)}
              className="rounded-full border border-black/10 px-4 py-2.5 text-[9px] font-semibold"
            >
              Move up
            </button>
            <button
              type="button"
              onClick={() => moveSelected(1)}
              className="rounded-full border border-black/10 px-4 py-2.5 text-[9px] font-semibold"
            >
              Move down
            </button>
          </div>

          <button
            type="button"
            onClick={save}
            className="rounded-full bg-[#001cac] px-5 py-3 text-[10px] font-semibold text-white"
          >
            {saved ? "Saved" : "Save hero settings"}
          </button>
        </div>
      </div>
    </section>
  );
}
