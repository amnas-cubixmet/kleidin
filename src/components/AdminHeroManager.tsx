"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { HeroSlideConfig } from "@/data/hero-slides";

type Draft = {
  title: string;
  label: string;
  subtitle: string;
  button: string;
  href: string;
  badge: string;
  imageUrl: string;
  kind: "product" | "offer" | "collection" | "custom";
  productId: string;
  enabled: boolean;
  order: string;
};

const emptyDraft: Draft = {
  title: "",
  label: "KLEID.IN",
  subtitle: "",
  button: "Shop now",
  href: "/products",
  badge: "",
  imageUrl: "",
  kind: "custom",
  productId: "",
  enabled: true,
  order: "0",
};

export function AdminHeroManager() {
  const [slides, setSlides] = useState<HeroSlideConfig[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/hero", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load hero slides.");
    setSlides(data.slides || []);
  }

  useEffect(() => {
    void load().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load hero."));
  }, []);

  function edit(slide: HeroSlideConfig) {
    setEditingId(slide.id);
    setDraft({
      title: slide.title,
      label: slide.label,
      subtitle: slide.subtitle,
      button: slide.button,
      href: slide.href,
      badge: slide.badge,
      imageUrl: slide.imageUrl,
      kind: slide.kind,
      productId: slide.productId || "",
      enabled: slide.enabled,
      order: String(slide.order),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function upload(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const signResponse = await fetch("/api/admin/uploads/signature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder: "kleidin/hero" }),
      });
      const signed = await signResponse.json();
      if (!signResponse.ok) throw new Error(signed.error || "Upload setup failed.");

      const body = new FormData();
      body.set("file", file);
      body.set("api_key", signed.apiKey);
      body.set("timestamp", String(signed.timestamp));
      body.set("folder", signed.folder);
      body.set("signature", signed.signature);

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/" + signed.cloudName + "/image/upload",
        { method: "POST", body },
      );
      const data = await response.json();
      if (!response.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed.");
      setDraft((current) => ({ ...current, imageUrl: data.secure_url }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(
      editingId ? "/api/admin/hero/" + editingId : "/api/admin/hero",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, order: Number(draft.order) }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save hero slide.");
      return;
    }
    reset();
    setMessage("Hero saved.");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this hero slide?")) return;
    const response = await fetch("/api/admin/hero/" + id, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not delete hero slide.");
      return;
    }
    await load();
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">HOMEPAGE</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">Hero control</h1>

      <form onSubmit={save} className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={draft.title} onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))} placeholder="Hero title" required className="rounded-xl border border-black/10 px-3 py-2.5 text-sm md:col-span-2" />
          <input value={draft.label} onChange={(e) => setDraft((c) => ({ ...c, label: e.target.value }))} placeholder="Label" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          <input value={draft.badge} onChange={(e) => setDraft((c) => ({ ...c, badge: e.target.value }))} placeholder="Badge" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          <textarea value={draft.subtitle} onChange={(e) => setDraft((c) => ({ ...c, subtitle: e.target.value }))} placeholder="Subtitle" className="min-h-20 rounded-xl border border-black/10 px-3 py-2.5 text-sm md:col-span-2" />
          <input value={draft.button} onChange={(e) => setDraft((c) => ({ ...c, button: e.target.value }))} placeholder="Button label" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          <input value={draft.href} onChange={(e) => setDraft((c) => ({ ...c, href: e.target.value }))} placeholder="/products" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          <select value={draft.kind} onChange={(e) => setDraft((c) => ({ ...c, kind: e.target.value as Draft["kind"] }))} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm">
            <option value="custom">Custom</option>
            <option value="product">Product</option>
            <option value="offer">Offer</option>
            <option value="collection">Collection</option>
          </select>
          <input value={draft.productId} onChange={(e) => setDraft((c) => ({ ...c, productId: e.target.value }))} placeholder="Product ID (for product hero)" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          <input type="number" value={draft.order} onChange={(e) => setDraft((c) => ({ ...c, order: e.target.value }))} placeholder="Order" className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-xs font-semibold">
            <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft((c) => ({ ...c, enabled: e.target.checked }))} />
            Enabled
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-black/10 p-3">
          {draft.imageUrl ? <Image src={draft.imageUrl} alt="" width={120} height={80} className="mb-2 h-20 w-32 rounded-lg object-cover" /> : null}
          <input type="file" accept="image/*" disabled={uploading} onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} className="text-xs" />
          {uploading ? <p className="mt-2 text-xs">Uploading…</p> : null}
        </div>

        {message ? <p className="mt-3 text-xs text-black/55">{message}</p> : null}
        <div className="mt-4 flex gap-2">
          <button className="rounded-xl bg-[#001cac] px-5 py-3 text-xs font-bold text-white">{editingId ? "Update hero" : "Add hero"}</button>
          {editingId ? <button type="button" onClick={reset} className="rounded-xl border border-black/10 px-5 py-3 text-xs font-bold">Cancel</button> : null}
        </div>
      </form>

      <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {slides.map((slide) => (
          <article key={slide.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
            <div className="relative aspect-[16/9] bg-black/5">
              {slide.imageUrl ? <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" /> : null}
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-[#001cac]">{slide.enabled ? "LIVE" : "HIDDEN"} · {slide.order}</p>
              <h2 className="mt-2 font-bold">{slide.title}</h2>
              <div className="mt-4 flex gap-2">
                <button onClick={() => edit(slide)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold">Edit</button>
                <button onClick={() => void remove(slide.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
