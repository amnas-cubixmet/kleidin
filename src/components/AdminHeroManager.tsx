"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type {
  HeroCtaStyle,
  HeroImagePosition,
  HeroSlideConfig,
  HeroSlideKind,
} from "@/data/hero-slides";

const kindOptions: { value: HeroSlideKind; label: string; note: string }[] = [
  { value: "product", label: "Product", note: "Feature one product" },
  { value: "offer", label: "Offer", note: "Timed sale or promotion" },
  { value: "collection", label: "Collection", note: "Category or edit" },
  { value: "custom", label: "Custom", note: "Brand message or campaign" },
];

function datetimeValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function emptyHero(order: number): Omit<HeroSlideConfig, "id"> {
  return {
    kind: "product",
    productId: null,
    label: "FEATURED",
    title: "FEATURED PRODUCT",
    subtitle: "Select a product and build this hero.",
    button: "View product",
    href: "",
    badge: "FEATURED",
    discountText: "",
    imageUrl: "",
    imagePublicId: null,
    startsAt: null,
    endsAt: null,
    showCountdown: false,
    ctaStyle: "light",
    imagePosition: "center",
    enabled: true,
    order,
  };
}

export function AdminHeroManager() {
  const [slides, setSlides] = useState<HeroSlideConfig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setLoading(true);
      setMessage("");

      const [heroResponse, productResponse] = await Promise.all([
        fetch("/api/admin/hero", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
      ]);

      const heroData = await heroResponse.json();
      const productData = await productResponse.json();

      if (!heroResponse.ok) {
        throw new Error(heroData.error || "Could not load hero settings.");
      }

      setConfigured(true);
      const nextSlides = (heroData.slides ?? []) as HeroSlideConfig[];
      setSlides(nextSlides);
      setProducts(
        productResponse.ok ? ((productData.products ?? []) as Product[]) : [],
      );

      setSelectedId((current) =>
        nextSlides.some((slide) => slide.id === current)
          ? current
          : nextSlides[0]?.id ?? "",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load hero settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const ordered = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides],
  );

  const selected =
    slides.find((slide) => slide.id === selectedId) ?? ordered[0] ?? null;

  const selectedProduct = selected?.productId
    ? products.find((product) => product.id === selected.productId)
    : undefined;

  const previewImage =
    selected?.imageUrl ||
    selectedProduct?.image ||
    selectedProduct?.colorVariants?.[0]?.images?.[0] ||
    "";

  function update(patch: Partial<HeroSlideConfig>) {
    if (!selected) return;
    setMessage("");
    setSlides((current) =>
      current.map((slide) =>
        slide.id === selected.id ? { ...slide, ...patch } : slide,
      ),
    );
  }

  async function addHero() {
    try {
      setSaving(true);
      setMessage("");
      const order = Math.max(0, ...slides.map((slide) => slide.order)) + 1;
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyHero(order)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not add hero.");

      const slide = data.slide as HeroSlideConfig;
      setSlides((current) => [...current, slide]);
      setSelectedId(slide.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add hero.");
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!selected) return;

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/admin/hero/" + selected.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save hero.");

      const updated = data.slide as HeroSlideConfig;
      setSlides((current) =>
        current.map((slide) => (slide.id === updated.id ? updated : slide)),
      );
      setMessage("Hero saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save hero.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected) return;
    if (!window.confirm("Delete this hero slide?")) return;

    try {
      setSaving(true);
      const next = slides.filter((slide) => slide.id !== selected.id);

      const response = await fetch("/api/admin/hero/" + selected.id, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete hero.");

      setSlides(next);
      setSelectedId(next[0]?.id ?? "");
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete hero.");
    } finally {
      setSaving(false);
    }
  }

  async function move(direction: -1 | 1) {
    if (!selected) return;

    const list = [...ordered];
    const index = list.findIndex((slide) => slide.id === selected.id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= list.length) return;

    const target = list[targetIndex];
    const first = { ...selected, order: target.order };
    const second = { ...target, order: selected.order };

    setSlides((current) =>
      current.map((slide) => {
        if (slide.id === first.id) return first;
        if (slide.id === second.id) return second;
        return slide;
      }),
    );

    await Promise.all([
      fetch("/api/admin/hero/" + first.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(first),
      }),
      fetch("/api/admin/hero/" + second.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(second),
      }),
    ]);
  }

  async function uploadHeroImage(file: File) {
    if (!selected) return;

    try {
      setUploadingMedia(true);
      setMessage("");

      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed.");
      }
      if (file.size > 12 * 1024 * 1024) {
        throw new Error("Image must be 12 MB or smaller.");
      }

      const signatureResponse = await fetch(
        "/api/admin/hero/upload?heroId=" + encodeURIComponent(selected.id),
        { cache: "no-store" },
      );
      const signatureData = (await signatureResponse.json()) as {
        cloudName?: string;
        apiKey?: string;
        timestamp?: number;
        folder?: string;
        signature?: string;
        error?: string;
      };

      if (
        !signatureResponse.ok ||
        !signatureData.cloudName ||
        !signatureData.apiKey ||
        !signatureData.timestamp ||
        !signatureData.folder ||
        !signatureData.signature
      ) {
        throw new Error(signatureData.error || "Could not prepare hero upload.");
      }

      const body = new FormData();
      body.set("file", file);
      body.set("api_key", signatureData.apiKey);
      body.set("timestamp", String(signatureData.timestamp));
      body.set("folder", signatureData.folder);
      body.set("signature", signatureData.signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        { method: "POST", body },
      );
      const data = (await response.json()) as {
        secure_url?: string;
        public_id?: string;
        error?: { message?: string };
      };

      if (!response.ok || !data.secure_url || !data.public_id) {
        throw new Error(data.error?.message || "Could not upload hero image.");
      }

      const previousPublicId = selected.imagePublicId ?? "";
      update({
        imageUrl: data.secure_url,
        imagePublicId: data.public_id,
      });

      if (previousPublicId && previousPublicId !== data.public_id) {
        await fetch("/api/admin/hero/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: previousPublicId }),
        }).catch(() => {});
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not upload hero image.",
      );
    } finally {
      setUploadingMedia(false);
    }
  }

  async function removeHeroImage() {
    if (!selected) return;

    const publicId = selected.imagePublicId ?? "";
    update({ imageUrl: "", imagePublicId: null });

    if (publicId) {
      await fetch("/api/admin/hero/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      }).catch(() => {});
    }
  }

  function chooseProduct(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      update({ productId: null });
      return;
    }

    update({
      productId: product.id,
      title: product.name.toUpperCase(),
      subtitle: product.description || "Featured from the current collection.",
      button: "View product",
      href: "/products/" + product.slug,
      badge: selected?.kind === "offer" ? selected.badge : product.category.toUpperCase(),
    });
  }

  const field =
    "h-12 w-full rounded-[12px] border border-[#d7dbe1] bg-white px-3.5 text-[12px] font-medium text-[#1d2025] outline-none transition placeholder:text-[#989fa8] focus:border-[#111111] focus:ring-2 focus:ring-black/10";
  const label =
    "mb-1.5 block text-[9px] font-bold uppercase tracking-[.09em] text-[#636b76]";

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white text-[11px] font-semibold text-[#69717c]">
        Loading hero builder…
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-[20px] border border-[#d9dde3] bg-white p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Hero slides
            </p>
            <strong className="mt-1.5 block text-[20px] font-semibold tracking-[-.035em]">
              {slides.length} saved
            </strong>
          </div>
          <button
            type="button"
            onClick={() => void addHero()}
            disabled={saving}
            className="min-h-[44px] rounded-full bg-[#111111] px-4 text-[10px] font-bold !text-white disabled:opacity-50"
            style={{ color: "#fff" }}
          >
            + Add
          </button>
        </div>

        {!configured ? (
          <div className="mt-3 rounded-[14px] border border-[#e0c2c2] bg-[#fff6f6] p-3 text-[9px] leading-5 text-[#8a3636]">
            MongoDB Atlas is required for hero management.
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          {ordered.length ? (
            ordered.map((slide, index) => {
              const active = slide.id === selected?.id;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setSelectedId(slide.id)}
                  className={
                    "flex min-h-[64px] w-full items-center gap-3 rounded-[14px] px-3 text-left transition " +
                    (active
                      ? "bg-[#111111] !text-white"
                      : "bg-[#f5f5f5] text-[#25292f] hover:bg-[#ededed]")
                  }
                  style={active ? { color: "#fff" } : undefined}
                >
                  <span className="w-7 shrink-0 text-[9px] font-bold opacity-60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[11px] font-semibold">
                      {slide.title || "Untitled hero"}
                    </strong>
                    <span className="mt-1 block truncate text-[8px] opacity-65">
                      {slide.kind.toUpperCase()}
                      {slide.enabled ? " · ACTIVE" : " · OFF"}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] bg-[#f5f5f5] px-4 py-8 text-center">
              <strong className="text-[11px] font-semibold">No hero slides</strong>
              <p className="mt-1.5 text-[9px] leading-5 text-[#747c86]">
                Add only the promotions or product heroes you actually need.
              </p>
            </div>
          )}
        </div>
      </aside>

      {selected ? (
        <div className="grid gap-4">
          <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
                  Hero type
                </p>
                <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em]">
                  Build this hero
                </h2>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={selected.enabled}
                onClick={() => update({ enabled: !selected.enabled })}
                className={
                  "relative h-[34px] w-[62px] rounded-full transition " +
                  (selected.enabled ? "bg-[#111111]" : "bg-[#d8dce2]")
                }
              >
                <span
                  className={
                    "absolute top-[4px] h-[26px] w-[26px] rounded-full bg-white shadow-sm transition " +
                    (selected.enabled ? "left-[32px]" : "left-[4px]")
                  }
                />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
              {kindOptions.map((option) => {
                const active = selected.kind === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      update({
                        kind: option.value,
                        showCountdown:
                          option.value === "offer"
                            ? selected.showCountdown
                            : false,
                      })
                    }
                    className={
                      "min-h-[72px] rounded-[14px] border p-3 text-left transition " +
                      (active
                        ? "border-[#111111] bg-[#111111] !text-white"
                        : "border-[#d9dde3] bg-white text-[#2d3238]")
                    }
                    style={active ? { color: "#fff" } : undefined}
                  >
                    <strong className="block text-[11px] font-bold">
                      {option.label}
                    </strong>
                    <span className="mt-1 block text-[8px] leading-4 opacity-65">
                      {option.note}
                    </span>
                  </button>
                );
              })}
            </div>

            {(selected.kind === "product" || selected.kind === "offer") ? (
              <label className="mt-4 block">
                <span className={label}>
                  {selected.kind === "offer" ? "Offer product (optional)" : "Product"}
                </span>
                <select
                  className={field}
                  value={selected.productId ?? ""}
                  onChange={(event) => chooseProduct(event.target.value)}
                >
                  <option value="">
                    {selected.kind === "offer"
                      ? "No specific product"
                      : "Choose product"}
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {product.sku}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </section>

          <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Content
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className={label}>Label</span>
                <input
                  className={field}
                  value={selected.label}
                  onChange={(event) => update({ label: event.target.value })}
                  placeholder="LIMITED OFFER"
                />
              </label>
              <label>
                <span className={label}>Badge</span>
                <input
                  className={field}
                  value={selected.badge}
                  onChange={(event) => update({ badge: event.target.value })}
                  placeholder="ONLY THIS WEEK"
                />
              </label>

              {selected.kind === "offer" ? (
                <label className="sm:col-span-2">
                  <span className={label}>Offer / discount text</span>
                  <input
                    className={field}
                    value={selected.discountText ?? ""}
                    onChange={(event) =>
                      update({ discountText: event.target.value })
                    }
                    placeholder="15% OFF / ₹500 OFF / BUY 2 GET 1"
                  />
                </label>
              ) : null}

              <label className="sm:col-span-2">
                <span className={label}>Title</span>
                <input
                  className={field}
                  value={selected.title}
                  onChange={(event) => update({ title: event.target.value })}
                />
              </label>

              <label className="sm:col-span-2">
                <span className={label}>Subtitle</span>
                <textarea
                  className="min-h-[110px] w-full resize-y rounded-[12px] border border-[#d7dbe1] bg-white p-3.5 text-[12px] leading-5 outline-none focus:border-[#111111] focus:ring-2 focus:ring-black/10"
                  value={selected.subtitle}
                  onChange={(event) => update({ subtitle: event.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Timing
            </p>
            <p className="mt-1 text-[10px] leading-5 text-[#68707b]">
              Leave dates empty to keep this hero available whenever it is enabled.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className={label}>Start</span>
                <input
                  type="datetime-local"
                  className={field}
                  value={datetimeValue(selected.startsAt)}
                  onChange={(event) =>
                    update({ startsAt: toIso(event.target.value) })
                  }
                />
              </label>
              <label>
                <span className={label}>End</span>
                <input
                  type="datetime-local"
                  className={field}
                  value={datetimeValue(selected.endsAt)}
                  onChange={(event) =>
                    update({ endsAt: toIso(event.target.value) })
                  }
                />
              </label>
            </div>

            {selected.kind === "offer" ? (
              <label className="mt-3 flex min-h-[48px] items-center gap-3 rounded-[12px] border border-[#d7dbe1] px-3.5">
                <input
                  type="checkbox"
                  checked={Boolean(selected.showCountdown)}
                  onChange={(event) =>
                    update({ showCountdown: event.target.checked })
                  }
                  className="h-4 w-4 accent-black"
                />
                <span className="text-[11px] font-semibold">
                  Show countdown until end time
                </span>
              </label>
            ) : null}
          </section>

          <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Button & media
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className={label}>Button text</span>
                <input
                  className={field}
                  value={selected.button}
                  onChange={(event) => update({ button: event.target.value })}
                />
              </label>
              <label>
                <span className={label}>Button link</span>
                <input
                  className={field}
                  value={selected.href}
                  onChange={(event) => update({ href: event.target.value })}
                  placeholder="/products or product auto-link"
                />
              </label>
              <div className="sm:col-span-2">
                <span className={label}>Hero image</span>
                <label className="flex min-h-[90px] cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#bfc5cd] bg-[#f8f8f8] px-4 text-center text-[10px] font-semibold text-[#555e69]">
                  {uploadingMedia
                    ? "Uploading to Cloudinary…"
                    : "Upload hero image · leave empty to use selected product image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingMedia}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadHeroImage(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {selected.imageUrl ? (
                  <div className="mt-2 overflow-hidden rounded-[12px] border border-[#d9dde3] bg-[#f5f5f5]">
                    <img
                      src={selected.imageUrl}
                      alt="Hero media"
                      className="aspect-[16/8] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => void removeHeroImage()}
                      className="min-h-[42px] w-full border-t border-[#e2e5e9] bg-white text-[9px] font-bold text-[#a33d3d]"
                    >
                      Remove hero image
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <span className={label}>Button style</span>
                <div className="grid grid-cols-3 gap-1.5 rounded-[14px] bg-[#f5f5f5] p-1.5">
                  {(["light", "dark", "outline"] as HeroCtaStyle[]).map(
                    (style) => {
                      const active = (selected.ctaStyle ?? "light") === style;
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => update({ ctaStyle: style })}
                          className={
                            "min-h-[42px] rounded-[10px] text-[9px] font-bold capitalize " +
                            (active
                              ? "bg-[#111111] !text-white"
                              : "bg-white text-[#555d67]")
                          }
                          style={active ? { color: "#fff" } : undefined}
                        >
                          {style}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <label>
                <span className={label}>Image position</span>
                <select
                  className={field}
                  value={selected.imagePosition ?? "center"}
                  onChange={(event) =>
                    update({
                      imagePosition: event.target.value as HeroImagePosition,
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-[#d9dde3] bg-[#071225] text-white">
            <div className="relative min-h-[340px] overflow-hidden p-5 sm:p-7">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt=""
                  className={
                    "absolute inset-0 h-full w-full object-cover opacity-55 " +
                    ((selected.imagePosition ?? "center") === "left"
                      ? "object-left"
                      : (selected.imagePosition ?? "center") === "right"
                        ? "object-right"
                        : "object-center")
                  }
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,24,.94),rgba(3,10,24,.55),rgba(3,10,24,.12))]" />

              <div className="relative z-10 flex min-h-[290px] max-w-[680px] flex-col justify-end">
                <span className="text-[9px] font-bold tracking-[.14em] text-white/65">
                  {selected.label}
                </span>
                {selected.discountText ? (
                  <strong className="mt-3 text-[14px] font-bold">
                    {selected.discountText}
                  </strong>
                ) : null}
                <h3 className="mt-2 text-[clamp(38px,7vw,72px)] font-semibold leading-[.9] tracking-[-.055em]">
                  {selected.title}
                </h3>
                <p className="mt-3 max-w-[500px] text-[11px] leading-5 text-white/70">
                  {selected.subtitle}
                </p>
                <span
                  className={
                    "mt-5 inline-flex min-h-[44px] w-fit items-center rounded-full px-5 text-[10px] font-bold " +
                    ((selected.ctaStyle ?? "light") === "dark"
                      ? "bg-[#111111] text-white"
                      : (selected.ctaStyle ?? "light") === "outline"
                        ? "border border-white/70 text-white"
                        : "bg-white text-[#111111]")
                  }
                >
                  {selected.button || "Shop now"}
                </span>
              </div>
            </div>
          </section>

          {message ? (
            <div className="rounded-[14px] border border-[#d9dde3] bg-white px-4 py-3 text-[10px] font-semibold text-[#555d67]">
              {message}
            </div>
          ) : null}

          <div className="sticky bottom-3 z-20 grid grid-cols-2 gap-2 rounded-[16px] border border-[#d9dde3] bg-white/95 p-2.5 shadow-[0_16px_40px_rgba(16,24,40,.12)] backdrop-blur sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => void move(-1)}
              className="min-h-[44px] rounded-full border border-[#d5d9df] bg-white px-4 text-[9px] font-bold"
            >
              Move up
            </button>
            <button
              type="button"
              onClick={() => void move(1)}
              className="min-h-[44px] rounded-full border border-[#d5d9df] bg-white px-4 text-[9px] font-bold"
            >
              Move down
            </button>
            <button
              type="button"
              onClick={() => void remove()}
              className="min-h-[44px] rounded-full border border-[#efcaca] bg-white px-4 text-[9px] font-bold text-[#a33d3d]"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || uploadingMedia}
              className="min-h-[46px] rounded-full bg-[#111111] px-6 text-[10px] font-bold !text-white disabled:opacity-50 sm:ml-auto"
              style={{ color: "#fff" }}
            >
              {saving ? "Saving…" : "Save hero"}
            </button>
          </div>
        </div>
      ) : (
        <section className="grid min-h-[420px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white px-5 text-center">
          <div>
            <strong className="text-[16px] font-semibold">Build only what you need</strong>
            <p className="mt-2 max-w-[420px] text-[10px] leading-5 text-[#68717b]">
              Add a product hero, timed offer, collection highlight or custom brand message.
            </p>
            <button
              type="button"
              onClick={() => void addHero()}
              className="mt-5 min-h-[46px] rounded-full bg-[#111111] px-6 text-[10px] font-bold !text-white"
              style={{ color: "#fff" }}
            >
              + Add first hero
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
