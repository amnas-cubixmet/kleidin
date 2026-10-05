"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { Product, ProductStatus } from "@/types/product";

type Draft = {
  name: string;
  sku: string;
  slug: string;
  category: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  description: string;
  sizes: string;
  colors: string;
  status: ProductStatus;
  featured: boolean;
  featuredAnimationEnabled: boolean;
  image: string;
  featuredImage: string;
  tryOnImage: string;
  wholesaleEnabled: boolean;
  wholesalePrice: string;
  wholesaleMinOrder: string;
};

const emptyDraft: Draft = {
  name: "",
  sku: "",
  slug: "",
  category: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  description: "",
  sizes: "",
  colors: "",
  status: "active",
  featured: false,
  featuredAnimationEnabled: false,
  image: "",
  featuredImage: "",
  tryOnImage: "",
  wholesaleEnabled: false,
  wholesalePrice: "",
  wholesaleMinOrder: "12",
};

function csv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");

  async function load() {
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load products.");
    setProducts(data.products || []);
  }

  useEffect(() => {
    void load().catch((error) =>
      setMessage(error instanceof Error ? error.message : "Could not load products."),
    );
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.category, product.slug]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [products, query]);

  function reset() {
    setEditingId(null);
    setDraft(emptyDraft);
    setMessage("");
  }

  function edit(product: Product) {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      category: product.category,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      description: product.description,
      sizes: product.sizes.join(", "),
      colors: product.colors.join(", "),
      status: product.status,
      featured: product.featured,
      featuredAnimationEnabled: Boolean(product.featuredAnimationEnabled),
      image: product.image || "",
      featuredImage: product.featuredImage || "",
      tryOnImage: product.tryOnImage || "",
      wholesaleEnabled: Boolean(product.wholesaleEnabled),
      wholesalePrice: product.wholesalePrice ? String(product.wholesalePrice) : "",
      wholesaleMinOrder: String(product.wholesaleMinOrder || 12),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function upload(file: File, field: "image" | "featuredImage" | "tryOnImage") {
    setUploading(field);
    setMessage("");

    try {
      const signatureResponse = await fetch("/api/admin/uploads/signature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder: "kleidin/products" }),
      });
      const signed = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(signed.error || "Upload setup failed.");

      const body = new FormData();
      body.set("file", file);
      body.set("api_key", signed.apiKey);
      body.set("timestamp", String(signed.timestamp));
      body.set("folder", signed.folder);
      body.set("signature", signed.signature);

      const uploadResponse = await fetch(
        "https://api.cloudinary.com/v1_1/" + signed.cloudName + "/image/upload",
        { method: "POST", body },
      );
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok || !uploaded.secure_url) {
        throw new Error(uploaded.error?.message || "Image upload failed.");
      }

      setDraft((current) => ({ ...current, [field]: uploaded.secure_url }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading("");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const payload = {
        ...draft,
        price: Number(draft.price || 0),
        compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
        stock: Number(draft.stock || 0),
        sizes: csv(draft.sizes),
        colors: csv(draft.colors),
        wholesalePrice: draft.wholesalePrice ? Number(draft.wholesalePrice) : null,
        wholesaleMinOrder: draft.wholesaleMinOrder ? Number(draft.wholesaleMinOrder) : null,
        featuredAnimationEnabled:
          draft.featured && draft.featuredAnimationEnabled,
      };

      const response = await fetch(
        editingId ? "/api/admin/products/" + editingId : "/api/admin/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save product.");

      await load();
      reset();
      setMessage(editingId ? "Product updated." : "Product created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this product?")) return;
    const response = await fetch("/api/admin/products/" + id, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not delete product.");
      return;
    }
    await load();
    if (editingId === id) reset();
  }

  function fileInput(
    label: string,
    field: "image" | "featuredImage" | "tryOnImage",
  ) {
    const value = draft[field];
    return (
      <label className="block rounded-xl border border-black/10 p-3">
        <span className="text-[11px] font-semibold">{label}</span>
        {value ? (
          <div className="mt-2 flex items-center gap-3">
            <Image
              src={value}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => setDraft((current) => ({ ...current, [field]: "" }))}
              className="text-xs font-semibold text-red-600"
            >
              Remove
            </button>
          </div>
        ) : null}
        <input
          type="file"
          accept="image/*"
          disabled={Boolean(uploading)}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) void upload(file, field);
            event.target.value = "";
          }}
          className="mt-2 block w-full text-xs"
        />
        {uploading === field ? <small>Uploading…</small> : null}
      </label>
    );
  }

  return (
    <div>
      <div>
        <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">CATALOG</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">Products</h1>
      </div>

      <form onSubmit={submit} className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{editingId ? "Edit product" : "Add product"}</h2>
          {editingId ? (
            <button type="button" onClick={reset} className="text-xs font-semibold text-black/45">
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-[11px] font-semibold">Name</span>
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: current.slug || slugify(event.target.value),
                }))
              }
              required
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold">SKU</span>
            <input value={draft.sku} onChange={(event) => setDraft((c) => ({ ...c, sku: event.target.value }))} required className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold">Slug</span>
            <input value={draft.slug} onChange={(event) => setDraft((c) => ({ ...c, slug: event.target.value }))} required className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold">Category</span>
            <input value={draft.category} onChange={(event) => setDraft((c) => ({ ...c, category: event.target.value }))} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold">Price</span>
            <input type="number" min="0" value={draft.price} onChange={(event) => setDraft((c) => ({ ...c, price: event.target.value }))} required className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold">Compare price</span>
            <input type="number" min="0" value={draft.compareAtPrice} onChange={(event) => setDraft((c) => ({ ...c, compareAtPrice: event.target.value }))} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold">Stock</span>
            <input type="number" min="0" value={draft.stock} onChange={(event) => setDraft((c) => ({ ...c, stock: event.target.value }))} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold">Status</span>
            <select value={draft.status} onChange={(event) => setDraft((c) => ({ ...c, status: event.target.value as ProductStatus }))} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="sold-out">Sold out</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-[11px] font-semibold">Sizes — comma separated</span>
            <input value={draft.sizes} onChange={(event) => setDraft((c) => ({ ...c, sizes: event.target.value }))} placeholder="S, M, L, XL" className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-[11px] font-semibold">Colours — comma separated</span>
            <input value={draft.colors} onChange={(event) => setDraft((c) => ({ ...c, colors: event.target.value }))} placeholder="Black, White" className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
          <label className="block md:col-span-2 lg:col-span-4">
            <span className="text-[11px] font-semibold">Description</span>
            <textarea value={draft.description} onChange={(event) => setDraft((c) => ({ ...c, description: event.target.value }))} className="mt-1 min-h-24 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {fileInput("Product image", "image")}
          {draft.featured ? fileInput("Featured animation image", "featuredImage") : null}
          {fileInput("Try-on image", "tryOnImage")}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-black/[.025] p-3 text-xs">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((c) => ({ ...c, featured: event.target.checked, featuredAnimationEnabled: event.target.checked ? c.featuredAnimationEnabled : false }))} />
            Featured
          </label>
          {draft.featured ? (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft.featuredAnimationEnabled} onChange={(event) => setDraft((c) => ({ ...c, featuredAnimationEnabled: event.target.checked }))} />
              Featured animation
            </label>
          ) : null}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={draft.wholesaleEnabled} onChange={(event) => setDraft((c) => ({ ...c, wholesaleEnabled: event.target.checked }))} />
            Dealer / wholesale
          </label>
        </div>

        {draft.wholesaleEnabled ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input type="number" min="0" placeholder="Wholesale price" value={draft.wholesalePrice} onChange={(event) => setDraft((c) => ({ ...c, wholesalePrice: event.target.value }))} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
            <input type="number" min="1" placeholder="Minimum order" value={draft.wholesaleMinOrder} onChange={(event) => setDraft((c) => ({ ...c, wholesaleMinOrder: event.target.value }))} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" />
          </div>
        ) : null}

        {message ? <p className="mt-3 text-xs font-medium text-black/60">{message}</p> : null}

        <button disabled={busy || Boolean(uploading)} className="mt-4 rounded-xl bg-[#001cac] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">
          {busy ? "Saving…" : editingId ? "Update product" : "Create product"}
        </button>
      </form>

      <section className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-bold">{products.length} products</h2>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product…" className="rounded-xl border border-black/10 px-3 py-2 text-sm md:w-72" />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-black/40">
              <tr>
                <th className="py-3">Product</th><th>SKU</th><th>Status</th><th>Price</th><th>Stock</th><th>Featured</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-t border-black/5">
                  <td className="py-3 font-semibold">{product.name}</td>
                  <td>{product.sku}</td>
                  <td className="capitalize">{product.status}</td>
                  <td>₹{product.price.toLocaleString("en-IN")}</td>
                  <td>{product.stock}</td>
                  <td>{product.featured ? "Yes" : "No"}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => edit(product)} className="rounded-lg border border-black/10 px-3 py-1.5 font-semibold">Edit</button>
                      <button onClick={() => void remove(product.id)} className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
