"use client";

import Image from "next/image";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { AdminDrawer } from "@/components/AdminDrawer";
import { uploadAdminImage } from "@/lib/admin-image-upload";
import type {
  HeroCtaStyle,
  HeroImagePosition,
  HeroOfferType,
  HeroSlideConfig,
} from "@/data/hero-slides";

type HeroMode = "custom" | "offer";

type Draft = {
  mode: HeroMode;
  title: string;
  label: string;
  subtitle: string;
  button: string;
  href: string;
  badge: string;
  discountText: string;
  imageUrl: string;
  startsAt: string;
  endsAt: string;
  showCountdown: boolean;
  ctaStyle: HeroCtaStyle;
  imagePosition: HeroImagePosition;
  enabled: boolean;
  order: string;
  offerType: HeroOfferType;
  offerValue: string;
};

const inputClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10";

const labelClass =
  "text-[9px] font-bold uppercase tracking-[.1em] text-black/45";

function makeDraft(mode: HeroMode = "custom"): Draft {
  return {
    mode,
    title: "",
    label: mode === "offer" ? "LIMITED OFFER" : "KLEID.IN",
    subtitle: "",
    button: mode === "offer" ? "Shop offer" : "Shop now",
    href: "/#all-products",
    badge: mode === "offer" ? "Offer" : "",
    discountText: "",
    imageUrl: "",
    startsAt: "",
    endsAt: "",
    showCountdown: mode === "offer",
    ctaStyle: "light",
    imagePosition: "center",
    enabled: true,
    order: "0",
    offerType: "percentage",
    offerValue: "",
  };
}

function dateTimeInput(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60_000,
  );
  return local.toISOString().slice(0, 16);
}

function apiDate(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function status(slide: HeroSlideConfig) {
  if (!slide.enabled) return "Hidden";

  const now = Date.now();
  const start = slide.startsAt ? new Date(slide.startsAt).getTime() : null;
  const end = slide.endsAt ? new Date(slide.endsAt).getTime() : null;

  if (start !== null && Number.isFinite(start) && now < start) {
    return "Scheduled";
  }

  if (end !== null && Number.isFinite(end) && now >= end) {
    return "Ended";
  }

  return "Live";
}

function offerSummary(slide: HeroSlideConfig) {
  const value = Number(slide.offerValue ?? 0);
  if (!value) return "Offer pricing not set";

  if ((slide.offerType ?? "percentage") === "percentage") {
    return value + "% off all products";
  }

  if (slide.offerType === "fixed") {
    return "₹" + value.toLocaleString("en-IN") + " off all products";
  }

  return "All products at ₹" + value.toLocaleString("en-IN");
}

export function AdminHeroManager() {
  const [slides, setSlides] = useState<HeroSlideConfig[]>([]);
  const [draft, setDraft] = useState<Draft>(() => makeDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/hero", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load hero content.");
    }

    setSlides(
      (data.slides || []).filter(
        (slide: HeroSlideConfig) =>
          slide.kind === "custom" || slide.kind === "offer",
      ),
    );
  }

  useEffect(() => {
    void load().catch((error) =>
      setMessage(
        error instanceof Error ? error.message : "Could not load hero content.",
      ),
    );
  }, []);

  const sortedSlides = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides],
  );

  function openCreate(mode: HeroMode) {
    const next = makeDraft(mode);
    next.order = String(slides.length);
    setEditingId(null);
    setDraft(next);
    setMessage("");
    setDrawerOpen(true);
  }

  function edit(slide: HeroSlideConfig) {
    const mode: HeroMode = slide.kind === "offer" ? "offer" : "custom";

    setEditingId(slide.id);
    setDraft({
      mode,
      title: slide.title,
      label: slide.label,
      subtitle: slide.subtitle,
      button: slide.button,
      href: slide.href,
      badge: slide.badge,
      discountText: slide.discountText || "",
      imageUrl: slide.imageUrl,
      startsAt: dateTimeInput(slide.startsAt),
      endsAt: dateTimeInput(slide.endsAt),
      showCountdown: Boolean(slide.showCountdown),
      ctaStyle: slide.ctaStyle ?? "light",
      imagePosition: slide.imagePosition ?? "center",
      enabled: slide.enabled,
      order: String(slide.order),
      offerType: slide.offerType ?? "percentage",
      offerValue: slide.offerValue ? String(slide.offerValue) : "",
    });
    setMessage("");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (uploading || saving) return;
    setDrawerOpen(false);
    setEditingId(null);
    setDraft(makeDraft());
  }

  async function upload(file: File) {
    setUploading(true);
    setMessage("");

    const previous = draft.imageUrl;
    const previewUrl = URL.createObjectURL(file);
    setDraft((current) => ({ ...current, imageUrl: previewUrl }));

    try {
      const uploaded = await uploadAdminImage(file, "kleidin/hero");
      setDraft((current) => ({ ...current, imageUrl: uploaded.url }));
      setMessage("Hero image uploaded. Save to publish.");
    } catch (error) {
      setDraft((current) => ({ ...current, imageUrl: previous }));
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploading(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;

    setSaving(true);
    setMessage("");

    try {
      if (!draft.title.trim()) {
        throw new Error("Add a hero title.");
      }

      if (draft.mode === "custom" && !draft.imageUrl.trim()) {
        throw new Error("Add an image for the image hero.");
      }

      const offerValue = Number(draft.offerValue || 0);

      if (draft.mode === "offer") {
        if (!Number.isFinite(offerValue) || offerValue <= 0) {
          throw new Error("Enter a valid offer value.");
        }

        if (draft.offerType === "percentage" && offerValue > 100) {
          throw new Error("Percentage offer cannot exceed 100%.");
        }
      }

      if (
        draft.startsAt &&
        draft.endsAt &&
        new Date(draft.endsAt).getTime() <= new Date(draft.startsAt).getTime()
      ) {
        throw new Error("End time must be after start time.");
      }

      const payload = {
        kind: draft.mode,
        productId: null,
        title: draft.title.trim(),
        label: draft.label.trim(),
        subtitle: draft.subtitle.trim(),
        button: draft.button.trim(),
        href: draft.href.trim() || "/#all-products",
        badge: draft.mode === "offer" ? draft.badge.trim() : "",
        discountText:
          draft.mode === "offer" ? draft.discountText.trim() : "",
        offerType: draft.mode === "offer" ? draft.offerType : "percentage",
        offerValue: draft.mode === "offer" ? offerValue : 0,
        imageUrl: draft.imageUrl.trim(),
        startsAt: draft.startsAt ? apiDate(draft.startsAt) : "",
        endsAt: draft.endsAt ? apiDate(draft.endsAt) : "",
        showCountdown:
          draft.mode === "offer" &&
          draft.showCountdown &&
          Boolean(draft.endsAt),
        ctaStyle: draft.ctaStyle,
        imagePosition: draft.imagePosition,
        enabled: draft.enabled,
        order: Number(draft.order || 0),
      };

      const response = await fetch(
        editingId ? "/api/admin/hero/" + editingId : "/api/admin/hero",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save hero.");
      }

      setDrawerOpen(false);
      setEditingId(null);
      setDraft(makeDraft());
      setMessage(
        draft.mode === "offer"
          ? "Offer hero saved. When live, its price applies to all storefront products."
          : "Image hero saved.",
      );
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save hero.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this hero?")) return;

    const response = await fetch("/api/admin/hero/" + id, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not delete hero.");
      return;
    }

    setMessage("Hero deleted.");
    await load();
  }

  async function toggle(slide: HeroSlideConfig) {
    const response = await fetch("/api/admin/hero/" + slide.id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: !slide.enabled }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not update hero.");
      return;
    }

    await load();
  }

  function imagePositionClass(position?: HeroImagePosition) {
    if (position === "left") return "object-left";
    if (position === "right") return "object-right";
    return "object-center";
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">
            HOMEPAGE
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">
            Hero
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-black/45">
            Add a normal image hero or run a timed offer hero. There is no
            separate layout/type system anymore.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => openCreate("custom")}
            className="min-h-11 rounded-xl border border-black/10 bg-white px-4 text-[10px] font-bold"
          >
            + Image Hero
          </button>
          <button
            type="button"
            onClick={() => openCreate("offer")}
            className="min-h-11 rounded-xl bg-[#001cac] px-4 text-[10px] font-bold !text-white"
          >
            + Offer Hero
          </button>
        </div>
      </div>

      <section className="mt-5 rounded-2xl bg-[#eef2ff] p-4 ring-1 ring-[#001cac]/10">
        <p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#001cac]">
          Offer behavior
        </p>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-black/55">
          A live Offer Hero applies its discount to every storefront product.
          When a newer scheduled offer becomes live, it can take over without
          changing product records individually.
        </p>
      </section>

      {message ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-xs font-medium text-black/60 ring-1 ring-black/5">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {sortedSlides.length ? (
          sortedSlides.map((slide) => {
            const state = status(slide);
            const isOffer = slide.kind === "offer";

            return (
              <article
                key={slide.id}
                className="overflow-hidden rounded-[22px] bg-white ring-1 ring-black/[.06]"
              >
                <div className="relative aspect-[16/8] overflow-hidden bg-[#e9e7e2]">
                  {slide.imageUrl ? (
                    <Image
                      src={slide.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={
                        "object-cover " + imagePositionClass(slide.imagePosition)
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#111,#001cac)]" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                  <div className="absolute inset-0 flex max-w-[72%] flex-col justify-center p-5 text-white">
                    <span className="text-[8px] font-bold uppercase tracking-[.14em] text-white/65">
                      {slide.label || (isOffer ? "OFFER" : "KLEID.IN")}
                    </span>
                    <strong className="mt-2 line-clamp-2 text-2xl font-black leading-[.9] tracking-[-.05em]">
                      {slide.title}
                    </strong>
                    {isOffer ? (
                      <span className="mt-3 text-[9px] font-bold uppercase tracking-[.08em] text-white/80">
                        {offerSummary(slide)}
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold uppercase text-black/60 backdrop-blur">
                      {isOffer ? "Offer Hero" : "Image Hero"}
                    </span>
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-[8px] font-bold uppercase backdrop-blur " +
                        (state === "Live"
                          ? "bg-emerald-500/90 text-white"
                          : state === "Scheduled"
                            ? "bg-amber-400/95 text-black"
                            : "bg-black/55 text-white")
                      }
                    >
                      {state}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold">{slide.title}</h2>
                      <p className="mt-1 text-[10px] text-black/45">
                        {isOffer
                          ? offerSummary(slide)
                          : slide.button || "No button"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[9px] font-bold text-black/35">
                      #{slide.order}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => edit(slide)}
                      className="min-h-10 rounded-xl border border-black/10 text-[9px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggle(slide)}
                      className="min-h-10 rounded-xl border border-black/10 text-[9px] font-bold"
                    >
                      {slide.enabled ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(slide.id)}
                      className="min-h-10 rounded-xl border border-red-200 text-[9px] font-bold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl bg-white p-6 text-sm text-black/45 ring-1 ring-black/5 lg:col-span-2">
            No managed hero yet. Add an Image Hero or Offer Hero. Until then,
            the storefront uses the existing fallback hero.
          </div>
        )}
      </div>

      <AdminDrawer
        open={drawerOpen}
        title={
          editingId
            ? "Edit " + (draft.mode === "offer" ? "offer hero" : "image hero")
            : "Add " + (draft.mode === "offer" ? "offer hero" : "image hero")
        }
        description={
          draft.mode === "offer"
            ? "This hero can run a timed store-wide offer across all products."
            : "Upload one image and add the title and button shown on the homepage."
        }
        onClose={closeDrawer}
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={closeDrawer}
              disabled={saving || uploading}
              className="min-h-11 rounded-xl border border-black/10 px-5 text-xs font-bold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="hero-editor-form"
              disabled={saving || uploading}
              className="min-h-11 rounded-xl bg-[#001cac] px-5 text-xs font-bold !text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save hero"}
            </button>
          </div>
        }
      >
        <form id="hero-editor-form" onSubmit={save} className="space-y-4">
          <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={labelClass}>
                  {draft.mode === "offer" ? "Offer Hero" : "Image Hero"}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-black/45">
                  {draft.mode === "offer"
                    ? "Discount is applied store-wide while this offer is live."
                    : "Simple image, title and CTA. No layout type selector."}
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      enabled: event.target.checked,
                    }))
                  }
                />
                {draft.enabled ? "On" : "Off"}
              </label>
            </div>
          </section>

          {draft.mode === "offer" ? (
            <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <p className={labelClass}>Store-wide offer</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Discount type</span>
                  <select
                    value={draft.offerType}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        offerType: event.target.value as HeroOfferType,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="percentage">Percentage off</option>
                    <option value="fixed">Fixed amount off</option>
                    <option value="sale-price">Set sale price</option>
                  </select>
                </label>

                <label>
                  <span className={labelClass}>
                    {draft.offerType === "percentage"
                      ? "Percentage"
                      : draft.offerType === "fixed"
                        ? "Amount"
                        : "Sale price"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={draft.offerValue}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        offerValue: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder={
                      draft.offerType === "percentage" ? "10" : "200"
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Offer badge</span>
                  <input
                    value={draft.badge}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        badge: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="SALE"
                  />
                </label>

                <label>
                  <span className={labelClass}>Offer text</span>
                  <input
                    value={draft.discountText}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        discountText: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="10% OFF STOREWIDE"
                  />
                </label>

                <label>
                  <span className={labelClass}>Starts</span>
                  <input
                    type="datetime-local"
                    value={draft.startsAt}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        startsAt: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>Ends</span>
                  <input
                    type="datetime-local"
                    value={draft.endsAt}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        endsAt: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="mt-3 flex min-h-11 items-center justify-between gap-4 rounded-xl border border-black/10 px-3 text-xs">
                Show countdown
                <input
                  type="checkbox"
                  checked={draft.showCountdown}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      showCountdown: event.target.checked,
                    }))
                  }
                />
              </label>
            </section>
          ) : null}

          <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <p className={labelClass}>Hero content</p>
            <div className="mt-3 grid gap-3">
              <label>
                <span className={labelClass}>Small label</span>
                <input
                  value={draft.label}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="KLEID.IN"
                />
              </label>

              <label>
                <span className={labelClass}>Title</span>
                <textarea
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className={inputClass + " min-h-24 resize-y py-3"}
                  placeholder="EVERYDAY. ON REPEAT."
                />
              </label>

              <label>
                <span className={labelClass}>Subtitle</span>
                <textarea
                  value={draft.subtitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      subtitle: event.target.value,
                    }))
                  }
                  className={inputClass + " min-h-20 resize-y py-3"}
                  placeholder="Short supporting copy"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Button text</span>
                  <input
                    value={draft.button}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        button: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="SHOP NOW"
                  />
                </label>

                <label>
                  <span className={labelClass}>Button link</span>
                  <input
                    value={draft.href}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        href: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="/#all-products"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={labelClass}>Hero image</p>
                <p className="mt-1 text-[10px] text-black/45">
                  Recommended 1920 × 1080 or a high-resolution landscape image.
                </p>
              </div>
              {uploading ? (
                <span className="text-[9px] font-bold uppercase text-[#001cac]">
                  Uploading…
                </span>
              ) : null}
            </div>

            <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-xl bg-[#eceae5]">
              {draft.imageUrl ? (
                draft.imageUrl.startsWith("blob:") ? (
                  <img
                    src={draft.imageUrl}
                    alt=""
                    className={
                      "h-full w-full object-cover " +
                      imagePositionClass(draft.imagePosition)
                    }
                  />
                ) : (
                  <Image
                    src={draft.imageUrl}
                    alt=""
                    fill
                    sizes="640px"
                    className={
                      "object-cover " + imagePositionClass(draft.imagePosition)
                    }
                  />
                )
              ) : (
                <div className="grid h-full place-items-center text-[9px] font-bold uppercase tracking-[.1em] text-black/30">
                  No image
                </div>
              )}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className={labelClass}>Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.currentTarget.value = "";
                  }}
                  className={inputClass + " py-2"}
                />
              </label>

              <label className="block min-w-[150px]">
                <span className={labelClass}>Image position</span>
                <select
                  value={draft.imagePosition}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      imagePosition: event.target.value as HeroImagePosition,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <p className={labelClass}>Display</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Button style</span>
                <select
                  value={draft.ctaStyle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      ctaStyle: event.target.value as HeroCtaStyle,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="outline">Outline</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>Order</span>
                <input
                  type="number"
                  value={draft.order}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      order: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
            </div>
          </section>
        </form>
      </AdminDrawer>
    </div>
  );
}
