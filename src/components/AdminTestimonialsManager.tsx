"use client";

import Image from "next/image";
import { StarRatingInput } from "@/components/StarRatingInput";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { readTestimonials, writeTestimonials } from "@/lib/testimonials";
import type { Testimonial } from "@/types/testimonial";
import { defaultTestimonials } from "@/data/testimonials";

type ProductOption = {
  slug: string;
  name: string;
};

type Draft = {
  name: string;
  quote: string;
  location: string;
  productSlug: string;
  showOnHome: boolean;
  rating: number;
  productImage: string;
  enabled: boolean;
};

const emptyDraft: Draft = {
  name: "",
  quote: "",
  location: "",
  productSlug: "",
  showOnHome: true,
  rating: 5,
  productImage: "",
  enabled: true,
};

export function AdminTestimonialsManager({
  products,
}: {
  products: ProductOption[];
}) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(readTestimonials());
  }, []);

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.slug, product.name])),
    [products],
  );

  function persist(next: Testimonial[]) {
    setItems(next);
    writeTestimonials(next);
  }

  function resetForm() {
    setDraft(emptyDraft);
    setEditingId(null);
    setError("");
  }

  function handleProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 1500000) {
      setError("Keep product photos under 1.5 MB in local mode.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        productImage: typeof reader.result === "string" ? reader.result : "",
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!draft.name.trim() || !draft.quote.trim()) {
      setError("Customer name and testimonial are required.");
      return;
    }

    if (editingId) {
      persist(
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                pending: item.pending ?? false,
                name: draft.name.trim(),
                quote: draft.quote.trim(),
                location: draft.location.trim() || undefined,
                productSlug: draft.productSlug || undefined,
                showOnHome: draft.showOnHome,
                rating: draft.rating,
                productImage: draft.productImage || undefined,
                enabled: draft.enabled,
              }
            : item,
        ),
      );
    } else {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : "testimonial-" + Date.now();

      persist([
        {
          id,
          name: draft.name.trim(),
          quote: draft.quote.trim(),
          location: draft.location.trim() || undefined,
          productSlug: draft.productSlug || undefined,
          showOnHome: draft.showOnHome,
          rating: draft.rating,
          productImage: draft.productImage || undefined,
          enabled: draft.enabled,
          pending: false,
          submittedByCustomer: false,
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);
    }

    resetForm();
  }

  function edit(item: Testimonial) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      quote: item.quote,
      location: item.location ?? "",
      productSlug: item.productSlug ?? "",
      showOnHome: item.showOnHome,
      rating: item.rating,
      productImage: item.productImage ?? "",
      enabled: item.enabled,
    });
    setError("");
  }

  function remove(id: string) {
    if (!window.confirm("Delete this testimonial?")) return;
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  function toggle(item: Testimonial) {
    persist(
      items.map((current) =>
        current.id === item.id
          ? current.pending
            ? { ...current, pending: false, enabled: true }
            : { ...current, enabled: !current.enabled }
          : current,
      ),
    );
  }

  function addDemoData() {
    const existingIds = new Set(items.map((item) => item.id));
    const missing = defaultTestimonials.filter(
      (item) => !existingIds.has(item.id),
    );

    if (!missing.length) {
      setError("Demo testimonials are already added.");
      return;
    }

    persist([...missing, ...items]);
    setError("");
  }

  return (
    <section className="mt-5 rounded-[22px] border border-black/8 bg-white p-4 md:p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
            TESTIMONIALS
          </p>
          <h2 className="mt-2 text-[28px] font-semibold tracking-[-.045em]">
            Customer stories.
          </h2>
          <p className="mt-2 max-w-[660px] text-[9px] leading-4 text-black/45">
            Add customer feedback, assign it to a product, publish it on Home,
            and upload an optional photo of the product the customer received.
            Customer submissions arrive here as pending for approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addDemoData}
            className="min-h-9 rounded-full border border-black/10 bg-white px-3 text-[8px] font-semibold text-black/65"
          >
            Add demo data
          </button>
          <strong className="text-[10px] text-black/50">
            {items.length} saved
          </strong>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <form onSubmit={submit} className="rounded-[18px] bg-[#f5f5f2] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">
                Customer name
              </span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                className="min-h-11 rounded-xl border border-black/10 bg-white px-3 text-[10px] outline-none"
                placeholder="Name"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">
                Location / label
              </span>
              <input
                value={draft.location}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                className="min-h-11 rounded-xl border border-black/10 bg-white px-3 text-[10px] outline-none"
                placeholder="Optional"
              />
            </label>
          </div>

          <label className="mt-3 grid gap-1.5">
            <span className="text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">
              Testimonial
            </span>
            <textarea
              value={draft.quote}
              onChange={(event) =>
                setDraft((current) => ({ ...current, quote: event.target.value }))
              }
              className="min-h-28 resize-y rounded-xl border border-black/10 bg-white p-3 text-[10px] leading-5 outline-none"
              placeholder="Customer's real feedback"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">
                Product
              </span>
              <select
                value={draft.productSlug}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    productSlug: event.target.value,
                  }))
                }
                className="min-h-11 rounded-xl border border-black/10 bg-white px-3 text-[10px] outline-none"
              >
                <option value="">General / no product</option>
                {products.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-1.5">
              <span className="text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">
                Rating
              </span>
              <StarRatingInput
                value={draft.rating}
                onChange={(rating) =>
                  setDraft((current) => ({ ...current, rating }))
                }
                theme="light"
                label="Testimonial rating"
              />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
            <span className="block text-[8px] font-semibold uppercase tracking-[.08em] text-black/45">
              Product photo
            </span>
            <p className="mt-1 text-[8px] leading-4 text-black/40">
              Optional photo of the product the customer received or wore.
            </p>

            <div className="mt-3 flex items-center gap-3">
              {draft.productImage ? (
                <Image
                  src={draft.productImage}
                  alt="Product photo preview"
                  width={72}
                  height={82}
                  unoptimized
                  className="h-[82px] w-[72px] rounded-lg object-cover"
                />
              ) : (
                <div className="grid h-[82px] w-[72px] place-items-center rounded-lg bg-[#f3f3f0] text-center text-[7px] text-black/35">
                  PRODUCT
                  <br />
                  PHOTO
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleProductImage}
                className="block min-w-0 flex-1 text-[8px] text-black/50 file:mr-2 file:rounded-full file:border-0 file:bg-black file:px-3 file:py-2 file:text-[8px] file:font-semibold file:text-white"
              />
            </div>

            {draft.productImage ? (
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({ ...current, productImage: "" }))
                }
                className="mt-2 text-[8px] font-semibold text-black/45 underline"
              >
                Remove product photo
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex min-h-10 items-center gap-2 text-[9px]">
              <input
                type="checkbox"
                checked={draft.showOnHome}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    showOnHome: event.target.checked,
                  }))
                }
              />
              Show on home
            </label>

            <label className="flex min-h-10 items-center gap-2 text-[9px]">
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
              Published
            </label>
          </div>

          {error ? (
            <p className="mt-2 text-[9px] font-medium text-red-600">{error}</p>
          ) : null}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="min-h-11 flex-1 rounded-full bg-[#001cac] px-4 text-[9px] font-semibold text-white"
            >
              {editingId ? "Save testimonial" : "Add testimonial"}
            </button>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-11 rounded-full border border-black/10 bg-white px-4 text-[9px] font-semibold"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="grid content-start gap-2.5">
          {items.length ? (
            items.map((item) => (
              <article
                key={item.id}
                className="rounded-[16px] border border-black/8 p-3"
              >
                <div className="flex gap-3">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt="Customer product"
                      width={72}
                      height={84}
                      unoptimized={item.productImage.startsWith("data:")}
                      className="h-[84px] w-[72px] flex-none rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-[84px] w-[72px] flex-none place-items-center rounded-lg bg-[#f3f3f0] text-center text-[7px] text-black/35">
                      NO PRODUCT
                      <br />
                      PHOTO
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-[10px]">{item.name}</strong>
                      <span
                        className={
                          "rounded-full px-2 py-1 text-[7px] font-semibold " +
                          (item.pending
                            ? "bg-amber-50 text-amber-700"
                            : item.enabled
                              ? "bg-green-50 text-green-700"
                              : "bg-black/5 text-black/45")
                        }
                      >
                        {item.pending
                          ? "Pending"
                          : item.enabled
                            ? "Published"
                            : "Hidden"}
                      </span>
                    </div>

                    <p className="mt-2 text-[9px] leading-4 text-black/60">
                      “{item.quote}”
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2 text-[7px] text-black/40">
                      <span>{"★".repeat(item.rating)}</span>
                      <span>
                        {item.productSlug
                          ? productNames.get(item.productSlug) ?? item.productSlug
                          : "General"}
                      </span>
                      {item.showOnHome ? <span>Home</span> : null}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => edit(item)}
                    className="min-h-9 rounded-full border border-black/10 px-3 text-[8px] font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    className="min-h-9 rounded-full border border-black/10 px-3 text-[8px] font-semibold"
                  >
                    {item.pending
                      ? "Approve & publish"
                      : item.enabled
                        ? "Hide"
                        : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="min-h-9 rounded-full border border-red-200 px-3 text-[8px] font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-black/15 px-4 py-10 text-center text-[9px] text-black/40">
              No testimonials yet. Add the first real customer story.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
