"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AdminDrawer } from "@/components/AdminDrawer";
import { uploadAdminImage } from "@/lib/admin-image-upload";
import type {
  HomepageHeroCampaign,
  HomepageHeroImagePosition,
  HomepageHeroMode,
  HomepageHeroOfferType,
} from "@/types/homepage-hero";

type Draft = {
  mode: HomepageHeroMode;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imagePosition: HomepageHeroImagePosition;
  enabled: boolean;
  priority: string;
  startsAt: string;
  endsAt: string;
  showCountdown: boolean;
  offerType: HomepageHeroOfferType;
  offerValue: string;
  offerBadge: string;
};

const inputClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10";
const labelClass =
  "text-[9px] font-bold uppercase tracking-[.1em] text-black/45";

function makeDraft(mode: HomepageHeroMode = "image"): Draft {
  return {
    mode,
    eyebrow: mode === "offer" ? "LIMITED OFFER" : "KLEID.IN",
    title: "",
    subtitle: "",
    buttonLabel: mode === "offer" ? "Shop offer" : "Shop now",
    buttonHref: "/#all-products",
    imageUrl: "",
    imagePosition: "center",
    enabled: true,
    priority: "0",
    startsAt: "",
    endsAt: "",
    showCountdown: mode === "offer",
    offerType: "percentage",
    offerValue: "",
    offerBadge: mode === "offer" ? "Offer" : "",
  };
}

function toInputDate(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60_000,
  );
  return local.toISOString().slice(0, 16);
}

function toApiDate(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function stateLabel(campaign: HomepageHeroCampaign) {
  if (!campaign.enabled) return "Hidden";

  const now = Date.now();
  const starts = campaign.startsAt
    ? new Date(campaign.startsAt).getTime()
    : null;
  const ends = campaign.endsAt ? new Date(campaign.endsAt).getTime() : null;

  if (starts !== null && Number.isFinite(starts) && now < starts) {
    return "Scheduled";
  }

  if (ends !== null && Number.isFinite(ends) && now >= ends) {
    return "Ended";
  }

  return "Live";
}

function offerSummary(campaign: HomepageHeroCampaign) {
  if (campaign.mode !== "offer") return "Image hero";

  if (campaign.offerType === "percentage") {
    return campaign.offerValue + "% off all products";
  }

  if (campaign.offerType === "fixed") {
    return (
      "₹" +
      campaign.offerValue.toLocaleString("en-IN") +
      " off all products"
    );
  }

  return (
    "All products at ₹" + campaign.offerValue.toLocaleString("en-IN")
  );
}

export function AdminHomepageHeroManager() {
  const [campaigns, setCampaigns] = useState<HomepageHeroCampaign[]>([]);
  const [draft, setDraft] = useState<Draft>(() => makeDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/homepage-hero", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load homepage hero.");
    }

    setCampaigns(data.campaigns || []);
  }

  useEffect(() => {
    void load().catch((error) =>
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load homepage hero.",
      ),
    );
  }, []);

  const sorted = useMemo(
    () => [...campaigns].sort((a, b) => a.priority - b.priority),
    [campaigns],
  );

  function openCreate(mode: HomepageHeroMode) {
    const next = makeDraft(mode);
    next.priority = String(campaigns.length);
    setDraft(next);
    setEditingId(null);
    setMessage("");
    setDrawerOpen(true);
  }

  function edit(campaign: HomepageHeroCampaign) {
    setDraft({
      mode: campaign.mode,
      eyebrow: campaign.eyebrow,
      title: campaign.title,
      subtitle: campaign.subtitle,
      buttonLabel: campaign.buttonLabel,
      buttonHref: campaign.buttonHref,
      imageUrl: campaign.imageUrl,
      imagePosition: campaign.imagePosition,
      enabled: campaign.enabled,
      priority: String(campaign.priority),
      startsAt: toInputDate(campaign.startsAt),
      endsAt: toInputDate(campaign.endsAt),
      showCountdown: campaign.showCountdown,
      offerType: campaign.offerType,
      offerValue: campaign.offerValue
        ? String(campaign.offerValue)
        : "",
      offerBadge: campaign.offerBadge,
    });
    setEditingId(campaign.id);
    setMessage("");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (saving || uploading) return;
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
      const uploaded = await uploadAdminImage(file, "kleidin/homepage-hero-v2");
      setDraft((current) => ({
        ...current,
        imageUrl: uploaded.url,
      }));
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

      if (draft.mode === "image" && !draft.imageUrl.trim()) {
        throw new Error("Upload a hero image.");
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
        new Date(draft.endsAt).getTime() <=
          new Date(draft.startsAt).getTime()
      ) {
        throw new Error("Offer end time must be after start time.");
      }

      const payload = {
        mode: draft.mode,
        eyebrow: draft.eyebrow.trim(),
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        buttonLabel: draft.buttonLabel.trim(),
        buttonHref: draft.buttonHref.trim() || "/#all-products",
        imageUrl: draft.imageUrl.trim(),
        imagePosition: draft.imagePosition,
        enabled: draft.enabled,
        priority: Number(draft.priority || 0),
        startsAt: draft.startsAt ? toApiDate(draft.startsAt) : "",
        endsAt: draft.endsAt ? toApiDate(draft.endsAt) : "",
        showCountdown:
          draft.mode === "offer" &&
          draft.showCountdown &&
          Boolean(draft.endsAt),
        offerType: draft.offerType,
        offerValue: draft.mode === "offer" ? offerValue : 0,
        offerBadge:
          draft.mode === "offer" ? draft.offerBadge.trim() : "",
      };

      const response = await fetch(
        editingId
          ? "/api/admin/homepage-hero/" + editingId
          : "/api/admin/homepage-hero",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save homepage hero.");
      }

      setDrawerOpen(false);
      setEditingId(null);
      setDraft(makeDraft());
      setMessage(
        draft.mode === "offer"
          ? "Offer hero saved. Live offer will apply to all products."
          : "Image hero saved.",
      );
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save homepage hero.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggle(campaign: HomepageHeroCampaign) {
    const response = await fetch(
      "/api/admin/homepage-hero/" + campaign.id,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: !campaign.enabled }),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not update homepage hero.");
      return;
    }

    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this homepage hero?")) return;

    const response = await fetch("/api/admin/homepage-hero/" + id, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not delete homepage hero.");
      return;
    }

    setMessage("Homepage hero deleted.");
    await load();
  }

  function positionClass(position: HomepageHeroImagePosition) {
    if (position === "left") return "object-left";
    if (position === "right") return "object-right";
    return "object-center";
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">
            HOMEPAGE / V2
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">
            Hero campaigns
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-black/45">
            Fresh hero system. Image heroes and store-wide offer heroes only.
            Old hero records are not used here.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => openCreate("image")}
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

      <div className="mt-5 rounded-2xl bg-[#eef2ff] p-4 ring-1 ring-[#001cac]/10">
        <p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#001cac]">
          New offer engine
        </p>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-black/55">
          A live Offer Hero overrides product offers across the storefront.
          When it ends, normal product offers automatically return.
        </p>
      </div>

      {message ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-xs font-medium text-black/60 ring-1 ring-black/5">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {sorted.length ? (
          sorted.map((campaign) => {
            const state = stateLabel(campaign);

            return (
              <article
                key={campaign.id}
                className="overflow-hidden rounded-[22px] bg-white ring-1 ring-black/[.06]"
              >
                <div className="relative aspect-[16/8] overflow-hidden bg-[#111]">
                  {campaign.imageUrl ? (
                    <Image
                      src={campaign.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={
                        "object-cover " +
                        positionClass(campaign.imagePosition)
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#111,#001cac)]" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />

                  <div className="absolute inset-0 flex max-w-[72%] flex-col justify-center p-5 text-white">
                    <span className="text-[8px] font-bold uppercase tracking-[.14em] text-white/65">
                      {campaign.eyebrow ||
                        (campaign.mode === "offer"
                          ? "OFFER"
                          : "KLEID.IN")}
                    </span>
                    <strong className="mt-2 line-clamp-2 text-2xl font-black leading-[.9] tracking-[-.05em]">
                      {campaign.title}
                    </strong>
                    {campaign.mode === "offer" ? (
                      <span className="mt-3 text-[9px] font-bold uppercase tracking-[.08em] text-white/80">
                        {offerSummary(campaign)}
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold uppercase text-black/60 backdrop-blur">
                      {campaign.mode === "offer"
                        ? "Offer Hero"
                        : "Image Hero"}
                    </span>
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-[8px] font-bold uppercase " +
                        (state === "Live"
                          ? "bg-emerald-500 text-white"
                          : state === "Scheduled"
                            ? "bg-amber-400 text-black"
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
                      <h2 className="truncate text-sm font-bold">
                        {campaign.title}
                      </h2>
                      <p className="mt-1 text-[10px] text-black/45">
                        {offerSummary(campaign)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[9px] font-bold text-black/35">
                      Priority {campaign.priority}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => edit(campaign)}
                      className="min-h-10 rounded-xl border border-black/10 text-[9px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggle(campaign)}
                      className="min-h-10 rounded-xl border border-black/10 text-[9px] font-bold"
                    >
                      {campaign.enabled ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(campaign.id)}
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
            No V2 hero campaigns yet. Add a new Image Hero or Offer Hero.
          </div>
        )}
      </div>

      <AdminDrawer
        open={drawerOpen}
        title={
          (editingId ? "Edit " : "Add ") +
          (draft.mode === "offer" ? "Offer Hero" : "Image Hero")
        }
        description={
          draft.mode === "offer"
            ? "Create a timed hero and apply its discount to every storefront product."
            : "Create a hero from one image, title and CTA."
        }
        onClose={closeDrawer}
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={closeDrawer}
              disabled={saving || uploading}
              className="min-h-11 rounded-xl border border-black/10 px-5 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="homepage-hero-v2-form"
              disabled={saving || uploading}
              className="min-h-11 rounded-xl bg-[#001cac] px-5 text-xs font-bold !text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save hero"}
            </button>
          </div>
        }
      >
        <form
          id="homepage-hero-v2-form"
          onSubmit={save}
          className="space-y-4"
        >
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
                        offerType:
                          event.target.value as HomepageHeroOfferType,
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
                  <span className={labelClass}>Value</span>
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
                    value={draft.offerBadge}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        offerBadge: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="SALE"
                  />
                </label>

                <label>
                  <span className={labelClass}>Priority</span>
                  <input
                    type="number"
                    value={draft.priority}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                    className={inputClass}
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
                Countdown
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
          ) : (
            <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Priority</span>
                  <input
                    type="number"
                    value={draft.priority}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>

                <label className="flex items-end">
                  <span className="flex min-h-11 w-full items-center justify-between rounded-xl border border-black/10 px-3 text-xs">
                    Enabled
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
                  </span>
                </label>
              </div>
            </section>
          )}

          {draft.mode === "offer" ? (
            <label className="flex min-h-11 items-center justify-between rounded-xl bg-white px-4 text-xs ring-1 ring-black/5">
              Enabled
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
            </label>
          ) : null}

          <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <p className={labelClass}>Content</p>

            <div className="mt-3 grid gap-3">
              <label>
                <span className={labelClass}>Eyebrow</span>
                <input
                  value={draft.eyebrow}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      eyebrow: event.target.value,
                    }))
                  }
                  className={inputClass}
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
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Button text</span>
                  <input
                    value={draft.buttonLabel}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        buttonLabel: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>Button link</span>
                  <input
                    value={draft.buttonHref}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        buttonHref: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <p className={labelClass}>Hero image</p>

            <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-xl bg-[#eceae5]">
              {draft.imageUrl ? (
                draft.imageUrl.startsWith("blob:") ? (
                  <img
                    src={draft.imageUrl}
                    alt=""
                    className={
                      "h-full w-full object-cover " +
                      positionClass(draft.imagePosition)
                    }
                  />
                ) : (
                  <Image
                    src={draft.imageUrl}
                    alt=""
                    fill
                    sizes="640px"
                    className={
                      "object-cover " +
                      positionClass(draft.imagePosition)
                    }
                  />
                )
              ) : (
                <div className="grid h-full place-items-center text-[9px] font-bold uppercase tracking-[.1em] text-black/30">
                  {draft.mode === "offer"
                    ? "Optional offer image"
                    : "No image"}
                </div>
              )}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
              <label>
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

              <label>
                <span className={labelClass}>Position</span>
                <select
                  value={draft.imagePosition}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      imagePosition:
                        event.target.value as HomepageHeroImagePosition,
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
        </form>
      </AdminDrawer>
    </div>
  );
}
