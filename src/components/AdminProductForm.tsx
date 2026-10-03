"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductColorVariant, ProductOfferType, ProductStatus } from "@/types/product";

type FormColor = {
  id: string;
  name: string;
  value: string;
  stock: string;
  images: string[];
};

type ProductFormState = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: string;
  compareAtPrice: string;
  offerEnabled: boolean;
  offerType: ProductOfferType;
  offerValue: string;
  offerLabel: string;
  offerBadge: string;
  offerStartsAt: string;
  offerEndsAt: string;
  offerCountdown: boolean;
  wholesaleEnabled: boolean;
  wholesalePrice: string;
  wholesaleMinOrder: string;
  wholesaleSlug: string;
  stock: string;
  sizes: string;
  description: string;
  featured: boolean;
  status: ProductStatus;
  image: string;
  tryOnImage: string;
  sortOrder: string;
  colors: FormColor[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeColor(): FormColor {
  return {
    id: "color-" + Math.random().toString(36).slice(2, 9),
    name: "Black",
    value: "#111111",
    stock: "0",
    images: [],
  };
}

function emptyForm(): ProductFormState {
  return {
    name: "",
    slug: "",
    sku: "",
    category: "T-Shirts",
    price: "",
    compareAtPrice: "",
    offerEnabled: false,
    offerType: "sale-price",
    offerValue: "",
    offerLabel: "Limited offer",
    offerBadge: "OFFER",
    offerStartsAt: "",
    offerEndsAt: "",
    offerCountdown: true,
    wholesaleEnabled: false,
    wholesalePrice: "",
    wholesaleMinOrder: "12",
    wholesaleSlug: "",
    stock: "0",
    sizes: "S, M, L, XL",
    description: "",
    featured: false,
    status: "draft",
    image: "",
    tryOnImage: "",
    sortOrder: "100",
    colors: [makeColor()],
  };
}

function fromProduct(product: Product): ProductFormState {
  const variants: ProductColorVariant[] =
    product.colorVariants?.length
      ? product.colorVariants
      : product.colors.map((name) => ({
          name,
          value: "#111111",
          stock: 0,
          images: [],
        }));

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    category: product.category,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    offerEnabled: Boolean(product.offerEnabled),
    offerType: product.offerType ?? "sale-price",
    offerValue: product.offerValue ? String(product.offerValue) : "",
    offerLabel: product.offerLabel ?? product.saleLabel ?? "Limited offer",
    offerBadge: product.offerBadge ?? "OFFER",
    offerStartsAt: product.offerStartsAt ? product.offerStartsAt.slice(0, 16) : "",
    offerEndsAt: product.offerEndsAt ? product.offerEndsAt.slice(0, 16) : "",
    offerCountdown: Boolean(product.offerCountdown),
    wholesaleEnabled: Boolean(product.wholesaleEnabled),
    wholesalePrice: product.wholesalePrice ? String(product.wholesalePrice) : "",
    wholesaleMinOrder: product.wholesaleMinOrder
      ? String(product.wholesaleMinOrder)
      : "12",
    wholesaleSlug: product.wholesaleSlug ?? "",
    stock: String(product.stock),
    sizes: product.sizes.join(", "),
    description: product.description,
    featured: product.featured,
    status: product.status,
    image: product.image ?? "",
    tryOnImage: product.tryOnImage ?? "",
    sortOrder: String(product.sortOrder ?? 100),
    colors: variants.map((variant) => ({
      id: "color-" + Math.random().toString(36).slice(2, 9),
      name: variant.name,
      value: variant.value || "#111111",
      stock: String(variant.stock ?? 0),
      images: variant.images?.length
        ? variant.images
        : variant.image
          ? [variant.image]
          : [],
    })),
  };
}

function storagePath(url: string) {
  const marker = "/storage/v1/object/public/products/";
  const index = url.indexOf(marker);
  if (index === -1) return "";
  return decodeURIComponent(url.slice(index + marker.length));
}

export function AdminProductForm({
  mode,
  productId,
}: {
  mode: "create" | "edit";
  productId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [uploadKey] = useState(() =>
    globalThis.crypto?.randomUUID?.() ?? "product-" + Date.now(),
  );
  const [slugLocked, setSlugLocked] = useState(mode === "edit");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !productId) return;

    let active = true;
    fetch("/api/admin/products/" + productId, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load product.");
        return data.product as Product;
      })
      .then((product) => {
        if (active) setForm(fromProduct(product));
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load product.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mode, productId]);

  const totalColorStock = useMemo(
    () =>
      form.colors.reduce(
        (sum, color) => sum + Math.max(0, Number(color.stock) || 0),
        0,
      ),
    [form.colors],
  );

  function update<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && !slugLocked) {
        const slug = slugify(String(value));
        next.slug = slug;
        if (!current.wholesaleSlug || current.wholesaleSlug.endsWith("-dealer")) {
          next.wholesaleSlug = slug ? slug + "-dealer" : "";
        }
      }
      return next;
    });
    setMessage("");
  }

  function updateColor(id: string, patch: Partial<FormColor>) {
    setForm((current) => ({
      ...current,
      colors: current.colors.map((color) =>
        color.id === id ? { ...color, ...patch } : color,
      ),
    }));
  }

  function addColor() {
    setForm((current) => ({
      ...current,
      colors: [...current.colors, makeColor()],
    }));
  }

  function removeColor(id: string) {
    setForm((current) => ({
      ...current,
      colors:
        current.colors.length === 1
          ? current.colors
          : current.colors.filter((color) => color.id !== id),
    }));
  }

  async function upload(file: File, color: string) {
    const body = new FormData();
    body.set("file", file);
    body.set("productId", productId || uploadKey);
    body.set("color", color);

    const response = await fetch("/api/admin/products/upload", {
      method: "POST",
      body,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Image upload failed.");
    return data.url as string;
  }

  async function uploadMain(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "image" | "tryOnImage",
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(kind);
      setMessage("");
      const url = await upload(file, kind === "image" ? "main" : "try-on");
      update(kind, url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading("");
      event.target.value = "";
    }
  }

  async function uploadColorImages(
    colorId: string,
    colorName: string,
    files: FileList | null,
  ) {
    if (!files?.length) return;

    try {
      setUploading(colorId);
      setMessage("");
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 6)) {
        urls.push(await upload(file, colorName || "color"));
      }
      const current = form.colors.find((color) => color.id === colorId);
      updateColor(colorId, {
        images: [...(current?.images ?? []), ...urls].slice(0, 8),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading("");
    }
  }

  async function removeUploadedImage(
    url: string,
    onRemove: () => void,
  ) {
    const path = storagePath(url);
    onRemove();

    if (!path) return;
    try {
      await fetch("/api/admin/products/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    } catch {
      // UI stays responsive; final product deletion also performs storage cleanup.
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.slug.trim() || !form.sku.trim()) {
      setMessage("Product name, slug and SKU are required.");
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      setMessage("Enter a valid retail price.");
      return;
    }
    if (form.offerEnabled) {
      if (!form.offerValue || Number(form.offerValue) <= 0) {
        setMessage("Enter a valid offer value.");
        return;
      }
      if (form.offerType === "percentage" && Number(form.offerValue) > 100) {
        setMessage("Percentage discount cannot be above 100%.");
        return;
      }
      if (
        form.offerType === "sale-price" &&
        Number(form.offerValue) >= Number(form.price)
      ) {
        setMessage("Sale price must be lower than retail price.");
        return;
      }
      if (
        form.offerStartsAt &&
        form.offerEndsAt &&
        new Date(form.offerEndsAt).getTime() <= new Date(form.offerStartsAt).getTime()
      ) {
        setMessage("Offer end time must be after start time.");
        return;
      }
    }

    if (form.wholesaleEnabled) {
      if (!form.wholesalePrice || Number(form.wholesalePrice) <= 0) {
        setMessage("Enter a wholesale price.");
        return;
      }
      if (!form.wholesaleMinOrder || Number(form.wholesaleMinOrder) < 1) {
        setMessage("Minimum wholesale quantity must be at least 1.");
        return;
      }
    }

    const colorVariants: ProductColorVariant[] = form.colors
      .map((color) => ({
        name: color.name.trim(),
        value: color.value || "#111111",
        stock: Math.max(0, Number(color.stock) || 0),
        image: color.images[0],
        images: color.images,
      }))
      .filter((color) => Boolean(color.name));

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug),
      sku: form.sku.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      offerEnabled: form.offerEnabled,
      offerType: form.offerType,
      offerValue: form.offerEnabled ? Number(form.offerValue) : null,
      offerLabel: form.offerEnabled ? form.offerLabel.trim() : null,
      offerBadge: form.offerEnabled ? form.offerBadge.trim() : null,
      offerStartsAt:
        form.offerEnabled && form.offerStartsAt
          ? new Date(form.offerStartsAt).toISOString()
          : null,
      offerEndsAt:
        form.offerEnabled && form.offerEndsAt
          ? new Date(form.offerEndsAt).toISOString()
          : null,
      offerCountdown: form.offerEnabled ? form.offerCountdown : false,
      wholesaleEnabled: form.wholesaleEnabled,
      wholesalePrice: form.wholesaleEnabled ? Number(form.wholesalePrice) : null,
      wholesaleMinOrder: form.wholesaleEnabled
        ? Number(form.wholesaleMinOrder)
        : null,
      wholesaleSlug: form.wholesaleEnabled
        ? slugify(form.wholesaleSlug || form.slug + "-dealer")
        : null,
      stock: Math.max(
        0,
        Number(form.stock) || (totalColorStock > 0 ? totalColorStock : 0),
      ),
      sizes: form.sizes
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      colors: colorVariants.map((color) => color.name),
      colorVariants,
      description: form.description.trim(),
      featured: form.featured,
      status: form.status,
      image: form.image || colorVariants[0]?.images?.[0] || null,
      tryOnImage: form.tryOnImage || null,
      sortOrder: Number(form.sortOrder) || 100,
    };

    try {
      setSaving(true);
      setMessage("");
      const endpoint =
        mode === "edit" && productId
          ? "/api/admin/products/" + productId
          : "/api/admin/products";
      const response = await fetch(endpoint, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save product.");

      router.push("/admin/products/" + data.product.id);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "h-12 w-full rounded-[12px] border border-[#d7dbe1] bg-white px-3.5 text-[12px] font-medium text-[#1d2025] outline-none transition placeholder:text-[#989fa8] focus:border-[#111111] focus:ring-2 focus:ring-black/10";
  const label =
    "mb-1.5 block text-[9px] font-bold uppercase tracking-[.09em] text-[#636b76]";
  const section =
    "rounded-[18px] border border-[#d9dde3] bg-white p-4 sm:rounded-[20px] sm:p-5";

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white text-[11px] font-semibold text-[#6c7480]">
        Loading product…
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <section className={section}>
        <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
          Product information
        </p>
        <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em]">
          {mode === "edit" ? "Edit product" : "Create product"}
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={label}>Product name</span>
            <input
              className={field}
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Core Heavy Tee — Black"
            />
          </label>
          <label>
            <span className={label}>Slug</span>
            <input
              className={field}
              value={form.slug}
              onChange={(event) => {
                setSlugLocked(true);
                update("slug", slugify(event.target.value));
              }}
              placeholder="core-heavy-tee-black"
            />
          </label>
          <label>
            <span className={label}>SKU</span>
            <input
              className={field}
              value={form.sku}
              onChange={(event) => update("sku", event.target.value.toUpperCase())}
              placeholder="KLD-TS-001"
            />
          </label>
          <label>
            <span className={label}>Category</span>
            <input
              className={field}
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
              placeholder="T-Shirts"
            />
          </label>
          <label>
            <span className={label}>Status</span>
            <select
              className={field}
              value={form.status}
              onChange={(event) =>
                update("status", event.target.value as ProductStatus)
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="sold-out">Sold out</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={label}>Description</span>
            <textarea
              className="min-h-[130px] w-full resize-y rounded-[12px] border border-[#d7dbe1] bg-white p-3.5 text-[12px] leading-5 outline-none focus:border-[#111111] focus:ring-2 focus:ring-black/10"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Fabric, fit, construction and product details…"
            />
          </label>
        </div>
      </section>

      <section className={section}>
        <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
          Retail pricing
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label>
            <span className={label}>Retail price</span>
            <input
              type="number"
              min="0"
              className={field}
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
              placeholder="1490"
            />
          </label>
          <label>
            <span className={label}>Compare / old price</span>
            <input
              type="number"
              min="0"
              className={field}
              value={form.compareAtPrice}
              onChange={(event) => update("compareAtPrice", event.target.value)}
              placeholder="1790"
            />
          </label>
          <label>
            <span className={label}>Total stock</span>
            <input
              type="number"
              min="0"
              className={field}
              value={form.stock}
              onChange={(event) => update("stock", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section id="offer-settings" className={section}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Product offer
            </p>
            <p className="mt-1 text-[10px] leading-5 text-[#68707b]">
              Create a normal sale or schedule a time-limited offer for this product.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.offerEnabled}
            onClick={() => update("offerEnabled", !form.offerEnabled)}
            className={
              "relative h-[34px] w-[62px] rounded-full transition " +
              (form.offerEnabled ? "bg-[#111111]" : "bg-[#d8dce2]")
            }
          >
            <span
              className={
                "absolute top-[4px] h-[26px] w-[26px] rounded-full bg-white shadow-sm transition " +
                (form.offerEnabled ? "left-[32px]" : "left-[4px]")
              }
            />
          </button>
        </div>

        {form.offerEnabled ? (
          <div className="mt-4 grid gap-4 rounded-[16px] bg-[#f5f5f5] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label>
                <span className={label}>Offer type</span>
                <select
                  className={field}
                  value={form.offerType}
                  onChange={(event) =>
                    update("offerType", event.target.value as ProductOfferType)
                  }
                >
                  <option value="sale-price">Sale price</option>
                  <option value="percentage">Percentage off</option>
                  <option value="fixed">Fixed ₹ off</option>
                </select>
              </label>
              <label>
                <span className={label}>
                  {form.offerType === "sale-price"
                    ? "Sale price"
                    : form.offerType === "percentage"
                      ? "Discount %"
                      : "Discount amount"}
                </span>
                <input
                  type="number"
                  min="0"
                  className={field}
                  value={form.offerValue}
                  onChange={(event) => update("offerValue", event.target.value)}
                  placeholder={
                    form.offerType === "sale-price"
                      ? "1190"
                      : form.offerType === "percentage"
                        ? "20"
                        : "300"
                  }
                />
              </label>
              <label>
                <span className={label}>Card badge</span>
                <input
                  className={field}
                  value={form.offerBadge}
                  onChange={(event) => update("offerBadge", event.target.value)}
                  placeholder="20% OFF"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className={label}>Offer label</span>
                <input
                  className={field}
                  value={form.offerLabel}
                  onChange={(event) => update("offerLabel", event.target.value)}
                  placeholder="Limited offer"
                />
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-[12px] border border-[#d7dbe1] bg-white px-3.5 sm:self-end">
                <input
                  type="checkbox"
                  checked={form.offerCountdown}
                  onChange={(event) => update("offerCountdown", event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-[11px] font-semibold">
                  Show countdown on product card
                </span>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className={label}>Offer starts</span>
                <input
                  type="datetime-local"
                  className={field}
                  value={form.offerStartsAt}
                  onChange={(event) => update("offerStartsAt", event.target.value)}
                />
              </label>
              <label>
                <span className={label}>Offer ends</span>
                <input
                  type="datetime-local"
                  className={field}
                  value={form.offerEndsAt}
                  onChange={(event) => update("offerEndsAt", event.target.value)}
                />
              </label>
            </div>

            <div className="rounded-[12px] border border-[#dedede] bg-white px-3.5 py-3 text-[9px] leading-5 text-[#69717c]">
              Leave start/end empty for an always-on offer. Add both times for a scheduled offer; it becomes active and expires automatically.
            </div>
          </div>
        ) : null}
      </section>

      <section className={section}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Wholesale
            </p>
            <p className="mt-1 text-[10px] leading-5 text-[#68707b]">
              Turn this on only when dealers can buy this product at wholesale pricing.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.wholesaleEnabled}
            onClick={() => update("wholesaleEnabled", !form.wholesaleEnabled)}
            className={
              "relative h-[34px] w-[62px] rounded-full transition " +
              (form.wholesaleEnabled ? "bg-[#111111]" : "bg-[#d8dce2]")
            }
          >
            <span
              className={
                "absolute top-[4px] h-[26px] w-[26px] rounded-full bg-white shadow-sm transition " +
                (form.wholesaleEnabled ? "left-[32px]" : "left-[4px]")
              }
            />
          </button>
        </div>

        {form.wholesaleEnabled ? (
          <div className="mt-4 grid gap-3 rounded-[16px] bg-[#f5f5f5] p-4 sm:grid-cols-3">
            <label>
              <span className={label}>Wholesale price</span>
              <input
                type="number"
                min="0"
                className={field}
                value={form.wholesalePrice}
                onChange={(event) => update("wholesalePrice", event.target.value)}
                placeholder="990"
              />
            </label>
            <label>
              <span className={label}>Minimum quantity</span>
              <input
                type="number"
                min="1"
                className={field}
                value={form.wholesaleMinOrder}
                onChange={(event) =>
                  update("wholesaleMinOrder", event.target.value)
                }
                placeholder="12"
              />
            </label>
            <label>
              <span className={label}>Wholesale URL slug</span>
              <input
                className={field}
                value={form.wholesaleSlug}
                onChange={(event) =>
                  update("wholesaleSlug", slugify(event.target.value))
                }
                placeholder="core-heavy-tee-dealer"
              />
            </label>
          </div>
        ) : null}
      </section>

      <section className={section}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Sizes & colours
            </p>
            <p className="mt-1 text-[10px] text-[#68707b]">
              Add images separately for each colour.
            </p>
          </div>
          <button
            type="button"
            onClick={addColor}
            className="min-h-[44px] rounded-full bg-[#111111] px-4 text-[10px] font-bold text-white"
          >
            + Add colour
          </button>
        </div>

        <label className="mt-4 block">
          <span className={label}>Sizes</span>
          <input
            className={field}
            value={form.sizes}
            onChange={(event) => update("sizes", event.target.value)}
            placeholder="S, M, L, XL"
          />
        </label>

        <div className="mt-4 grid gap-3">
          {form.colors.map((color, index) => (
            <div
              key={color.id}
              className="rounded-[16px] border border-[#d9dde3] bg-[#f8f8f8] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-[11px] font-bold">
                  Colour {index + 1}
                </strong>
                {form.colors.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeColor(color.id)}
                    className="min-h-[40px] px-2 text-[9px] font-bold text-[#a33d3d]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_140px]">
                <label>
                  <span className={label}>Colour name</span>
                  <input
                    className={field}
                    value={color.name}
                    onChange={(event) =>
                      updateColor(color.id, { name: event.target.value })
                    }
                    placeholder="Black"
                  />
                </label>
                <label>
                  <span className={label}>Colour</span>
                  <div className="flex h-12 items-center gap-2 rounded-[12px] border border-[#d7dbe1] bg-white px-2">
                    <input
                      type="color"
                      value={color.value}
                      onChange={(event) =>
                        updateColor(color.id, { value: event.target.value })
                      }
                      className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[9px] font-semibold">{color.value}</span>
                  </div>
                </label>
                <label>
                  <span className={label}>Colour stock</span>
                  <input
                    type="number"
                    min="0"
                    className={field}
                    value={color.stock}
                    onChange={(event) =>
                      updateColor(color.id, { stock: event.target.value })
                    }
                  />
                </label>
              </div>

              <div className="mt-3">
                <span className={label}>Images for {color.name || "this colour"}</span>
                <label className="flex min-h-[72px] cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#bfc5cd] bg-white px-4 text-center text-[10px] font-semibold text-[#555e69]">
                  {uploading === color.id
                    ? "Uploading…"
                    : "Choose images · up to 8 per colour · 8 MB each"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading === color.id}
                    onChange={(event) => {
                      void uploadColorImages(
                        color.id,
                        color.name,
                        event.target.files,
                      );
                      event.target.value = "";
                    }}
                  />
                </label>

                {color.images.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {color.images.map((url) => (
                      <div
                        key={url}
                        className="overflow-hidden rounded-[12px] border border-[#d9dde3] bg-white"
                      >
                        <img
                          src={url}
                          alt={color.name}
                          className="aspect-square w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            void removeUploadedImage(url, () =>
                              updateColor(color.id, {
                                images: color.images.filter(
                                  (image) => image !== url,
                                ),
                              }),
                            )
                          }
                          className="min-h-[40px] w-full border-t border-[#e2e5e9] text-[9px] font-bold text-[#a33d3d]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={section}>
        <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
          Product media
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <span className={label}>Main image</span>
            <label className="flex min-h-[90px] cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#bfc5cd] bg-[#f8f8f8] px-4 text-center text-[10px] font-semibold text-[#555e69]">
              {uploading === "image" ? "Uploading…" : "Upload main product image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void uploadMain(event, "image")}
              />
            </label>
            {form.image ? (
              <div className="mt-2 overflow-hidden rounded-[12px] border border-[#d9dde3]">
                <img
                  src={form.image}
                  alt="Main product"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ) : null}
          </div>
          <div>
            <span className={label}>Try-on image</span>
            <label className="flex min-h-[90px] cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#bfc5cd] bg-[#f8f8f8] px-4 text-center text-[10px] font-semibold text-[#555e69]">
              {uploading === "tryOnImage"
                ? "Uploading…"
                : "Upload transparent try-on image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void uploadMain(event, "tryOnImage")}
              />
            </label>
            {form.tryOnImage ? (
              <div className="mt-2 overflow-hidden rounded-[12px] border border-[#d9dde3] bg-[#f5f5f5]">
                <img
                  src={form.tryOnImage}
                  alt="Try-on"
                  className="aspect-[4/3] w-full object-contain"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={section}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className={label}>Sort order</span>
            <input
              type="number"
              className={field}
              value={form.sortOrder}
              onChange={(event) => update("sortOrder", event.target.value)}
            />
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-[12px] border border-[#d7dbe1] px-3.5 sm:self-end">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => update("featured", event.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <span className="text-[11px] font-semibold">Featured product</span>
          </label>
        </div>
      </section>

      {message ? (
        <div className="rounded-[14px] border border-[#e0c2c2] bg-[#fff6f6] px-4 py-3 text-[10px] font-semibold text-[#953b3b]">
          {message}
        </div>
      ) : null}

      <div className="sticky bottom-3 z-20 flex flex-col gap-2 rounded-[16px] border border-[#d9dde3] bg-white/95 p-2.5 shadow-[0_16px_40px_rgba(16,24,40,.12)] backdrop-blur xs:flex-row">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-[46px] w-full rounded-full border border-[#d5d9df] bg-white px-5 text-[10px] font-bold text-[#4f5761] xs:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || Boolean(uploading)}
          className="min-h-[46px] flex-1 rounded-full bg-[#111111] px-6 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Create product"}
        </button>
      </div>
    </form>
  );
}
