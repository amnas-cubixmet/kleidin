"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";

const STORAGE_KEY = "kleidin-admin-product-drafts";

type ProductDraft = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  sizes: string;
  colors: string;
  image: string;
  description: string;
  featured: boolean;
  status: "active" | "draft" | "sold-out";
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyDraft(): ProductDraft {
  return {
    id: "",
    name: "",
    slug: "",
    sku: "",
    category: "T-Shirts",
    price: "",
    compareAtPrice: "",
    stock: "0",
    sizes: "S, M, L, XL",
    colors: "Black",
    image: "",
    description: "",
    featured: false,
    status: "draft",
  };
}

function readSavedDrafts() {
  if (typeof window === "undefined") return [] as ProductDraft[];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function AdminProductManager({
  products,
}: {
  products: Pick<Product, "id" | "name" | "slug" | "sku" | "category" | "price" | "stock">[];
}) {
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [savedDrafts, setSavedDrafts] = useState<ProductDraft[]>(readSavedDrafts);
  const [slugLocked, setSlugLocked] = useState(false);
  const [message, setMessage] = useState("");

  const existingSlugs = useMemo(
    () => new Set([...products.map((item) => item.slug), ...savedDrafts.map((item) => item.slug)]),
    [products, savedDrafts],
  );

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && !slugLocked) {
        next.slug = slugify(String(value));
      }
      return next;
    });
    setMessage("");
  }

  function saveDraft() {
    const name = draft.name.trim();
    const slug = slugify(draft.slug || draft.name);

    if (!name || !slug || !draft.price.trim()) {
      setMessage("Name, slug and selling price are required.");
      return;
    }

    if (existingSlugs.has(slug) && !savedDrafts.some((item) => item.id === draft.id && item.slug === slug)) {
      setMessage("This slug already exists. Change the product name or slug.");
      return;
    }

    const record: ProductDraft = {
      ...draft,
      id: draft.id || (crypto.randomUUID?.() ?? `draft-${Date.now()}`),
      name,
      slug,
      sku: draft.sku.trim() || `KLD-${String(Date.now()).slice(-6)}`,
      category: draft.category.trim() || "Uncategorised",
      price: draft.price.trim(),
      stock: draft.stock.trim() || "0",
    };

    const next = draft.id
      ? savedDrafts.map((item) => (item.id === draft.id ? record : item))
      : [record, ...savedDrafts];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedDrafts(next);
    setDraft(emptyDraft());
    setSlugLocked(false);
    setMessage("Product draft saved on this device.");
  }

  function editDraft(item: ProductDraft) {
    setDraft(item);
    setSlugLocked(true);
    setMessage("");
  }

  function deleteDraft(id: string) {
    const next = savedDrafts.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedDrafts(next);
    if (draft.id === id) {
      setDraft(emptyDraft());
      setSlugLocked(false);
    }
  }

  const field =
    "h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-[12px] outline-none focus:border-[#001cac]";

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-[22px] border border-black/8 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
              PRODUCT CONTROL
            </p>
            <h2 className="mt-1 text-[26px] font-semibold tracking-[-.04em]">
              Create product.
            </h2>
          </div>
          <span className="text-[8px] text-black/35">Slug auto-generates from name</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Product name</span>
            <input className={field} value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Core Heavy Tee — Black" />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Slug</span>
            <input
              className={field}
              value={draft.slug}
              onChange={(e) => {
                setSlugLocked(true);
                update("slug", slugify(e.target.value));
              }}
              placeholder="core-heavy-tee-black"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">SKU</span>
            <input className={field} value={draft.sku} onChange={(e) => update("sku", e.target.value)} placeholder="Auto when blank" />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Category</span>
            <input className={field} value={draft.category} onChange={(e) => update("category", e.target.value)} />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Selling price</span>
            <input type="number" min="0" className={field} value={draft.price} onChange={(e) => update("price", e.target.value)} placeholder="1490" />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Old price</span>
            <input type="number" min="0" className={field} value={draft.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} placeholder="1790" />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Stock</span>
            <input type="number" min="0" className={field} value={draft.stock} onChange={(e) => update("stock", e.target.value)} />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Status</span>
            <select className={field} value={draft.status} onChange={(e) => update("status", e.target.value as ProductDraft["status"])}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="sold-out">Sold out</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Sizes</span>
            <input className={field} value={draft.sizes} onChange={(e) => update("sizes", e.target.value)} placeholder="S, M, L, XL" />
          </label>

          <label>
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Colours</span>
            <input className={field} value={draft.colors} onChange={(e) => update("colors", e.target.value)} placeholder="Black, White, Blue" />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Image URL</span>
            <input className={field} value={draft.image} onChange={(e) => update("image", e.target.value)} placeholder="https://..." />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">Description</span>
            <textarea className="min-h-28 w-full resize-none rounded-xl border border-black/10 bg-white p-3 text-[12px] outline-none focus:border-[#001cac]" value={draft.description} onChange={(e) => update("description", e.target.value)} />
          </label>

          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-black/10 px-3 sm:col-span-2">
            <input type="checkbox" checked={draft.featured} onChange={(e) => update("featured", e.target.checked)} className="accent-[#001cac]" />
            <span className="text-[10px] font-semibold">Featured product</span>
          </label>
        </div>

        {message ? <p className="mt-3 text-[9px] text-[#001cac]">{message}</p> : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={saveDraft} className="min-h-11 flex-1 rounded-full bg-[#001cac] px-5 text-[9px] font-semibold text-white">
            {draft.id ? "Update product draft" : "Save product draft"}
          </button>
          <button type="button" onClick={() => { setDraft(emptyDraft()); setSlugLocked(false); setMessage(""); }} className="min-h-11 rounded-full border border-black/10 px-5 text-[9px] font-semibold">
            Clear
          </button>
        </div>
      </div>

      <aside className="rounded-[22px] border border-black/8 bg-white p-4 sm:p-5">
        <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">LOCAL PRODUCT DRAFTS</p>
        <h2 className="mt-1 text-[24px] font-semibold tracking-[-.04em]">{savedDrafts.length} saved</h2>
        <p className="mt-2 text-[9px] leading-4 text-black/45">
          Saved in this browser for local control. Source catalogue remains in the project data files.
        </p>

        <div className="mt-4 space-y-2">
          {savedDrafts.length ? savedDrafts.map((item) => (
            <div key={item.id} className="rounded-[14px] bg-[#f6f6f3] p-3">
              <strong className="block text-[10px]">{item.name}</strong>
              <span className="mt-1 block text-[7px] text-black/40">/{item.slug}</span>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => editDraft(item)} className="min-h-9 flex-1 rounded-full bg-white px-3 text-[8px] font-semibold">Edit</button>
                <button type="button" onClick={() => deleteDraft(item.id)} className="min-h-9 rounded-full border border-black/10 px-3 text-[8px] font-semibold">Delete</button>
              </div>
            </div>
          )) : (
            <div className="rounded-[14px] bg-[#f6f6f3] p-4 text-[9px] leading-4 text-black/45">
              No local product drafts yet.
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
