"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

function productImage(product: Product) {
  return (
    product.image ||
    product.colorVariants?.find((variant) => variant.images?.length)?.images?.[0] ||
    product.colorVariants?.find((variant) => variant.image)?.image ||
    ""
  );
}

function hasFeatureImage(product: Product) {
  return Boolean(productImage(product));
}

function isReady(product: Product) {
  return product.status === "active" && hasFeatureImage(product);
}

export function AdminFeaturedManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/featured", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load featured products.");
        }
        return (data.products ?? []) as Product[];
      })
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((error) => {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load featured products.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const featured = useMemo(
    () =>
      products
        .filter((product) => product.featured)
        .sort(
          (a, b) =>
            (a.featuredSortOrder ?? a.sortOrder ?? 100) -
              (b.featuredSortOrder ?? b.sortOrder ?? 100) ||
            a.name.localeCompare(b.name),
        ),
    [products],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.sku, product.category, product.status].some(
        (value) => value.toLowerCase().includes(term),
      ),
    );
  }, [products, query]);

  function setFeatured(id: string, nextFeatured: boolean) {
    setProducts((current) => {
      const maxOrder = Math.max(
        0,
        ...current
          .filter((product) => product.featured)
          .map(
            (product) =>
              product.featuredSortOrder ?? product.sortOrder ?? 100,
          ),
      );

      return current.map((product) =>
        product.id === id
          ? {
              ...product,
              featured: nextFeatured,
              status: nextFeatured ? "active" : product.status,
              featuredSortOrder: nextFeatured
                ? maxOrder + 10
                : product.featuredSortOrder ?? product.sortOrder ?? 100,
            }
          : product,
      );
    });
    setDirty(true);
    setMessage("");
  }

  function move(id: string, direction: -1 | 1) {
    const ordered = [...featured];
    const index = ordered.findIndex((product) => product.id === id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;

    const currentOrder =
      ordered[index].featuredSortOrder ??
      ordered[index].sortOrder ??
      (index + 1) * 10;
    const targetOrder =
      ordered[nextIndex].featuredSortOrder ??
      ordered[nextIndex].sortOrder ??
      (nextIndex + 1) * 10;

    setProducts((current) =>
      current.map((product) => {
        if (product.id === ordered[index].id) {
          return { ...product, featuredSortOrder: targetOrder };
        }
        if (product.id === ordered[nextIndex].id) {
          return { ...product, featuredSortOrder: currentOrder };
        }
        return product;
      }),
    );
    setDirty(true);
    setMessage("");
  }

  async function save() {
    try {
      setSaving(true);
      setMessage("");

      const featuredOrder = new Map(
        [...featured]
          .filter(isReady)
          .sort(
            (a, b) =>
              (a.featuredSortOrder ?? a.sortOrder ?? 100) -
              (b.featuredSortOrder ?? b.sortOrder ?? 100) ||
              a.name.localeCompare(b.name),
          )
          .map((product, index) => [product.id, (index + 1) * 10]),
      );

      const items = products.map((product) => {
        const order = featuredOrder.get(product.id);

        return {
          id: product.id,
          featured: order !== undefined && isReady(product),
          featuredSortOrder:
            order ??
            product.featuredSortOrder ??
            product.sortOrder ??
            100,
        };
      });

      const response = await fetch("/api/admin/featured", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save featured products.");
      }

      setProducts((data.products ?? []) as Product[]);
      setDirty(false);
      setMessage("Featured section saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save featured products.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white text-[11px] font-semibold text-[#6c7480]">
        Loading featured products…
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
              Homepage section 02
            </p>
            <h2 className="mt-1.5 text-[28px] font-semibold tracking-[-.045em] sm:text-[34px]">
              Featured items
            </h2>
            <p className="mt-2 max-w-[720px] text-[10px] leading-5 text-[#68717d] sm:text-[11px]">
              Select active products with real media, arrange their order, then save.
              The homepage Featured section uses this list directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d3d7dd] bg-white px-5 text-[10px] font-bold text-[#313740]"
            >
              Preview storefront
            </Link>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => void save()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#111111] px-6 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : dirty ? "Save featured" : "Saved"}
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-[13px] border border-[#d9dde3] bg-[#f7f8fb] px-4 py-3 text-[10px] font-semibold text-[#525b66]">
            {message}
          </div>
        ) : null}
      </section>

      <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#727985]">
              Live order
            </p>
            <h3 className="mt-1 text-[22px] font-semibold tracking-[-.04em]">
              Homepage sequence
            </h3>
          </div>
          <span className="rounded-full bg-[#eef2ff] px-3 py-2 text-[9px] font-bold text-[#001cac]">
            {featured.filter(isReady).length} ready
          </span>
        </div>

        {featured.length ? (
          <div className="mt-4 grid gap-2">
            {featured.map((product, index) => {
              const image = productImage(product);
              const ready = isReady(product);

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-[#e0e3e8] bg-[#fafafa] p-2.5 sm:grid-cols-[68px_minmax(0,1fr)_auto]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[10px] bg-[#ececec]">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[7px] font-bold uppercase text-black/35">
                        No image
                      </div>
                    )}
                    <span className="absolute left-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white/90 px-1 text-[8px] font-bold text-[#111111]">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <strong className="block truncate text-[11px] font-semibold">
                      {product.name}
                    </strong>
                    <span className="mt-1 block truncate text-[9px] text-[#757d88]">
                      {product.sku} · {product.category}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-1 text-[8px] font-bold " +
                          (ready
                            ? "bg-[#eaf7ef] text-[#247a44]"
                            : "bg-[#fff3e8] text-[#9a5a12]")
                        }
                      >
                        {ready
                          ? "Ready for homepage"
                          : product.status !== "active"
                            ? "Set product Active"
                            : "Add product image"}
                      </span>
                      <span className="inline-flex rounded-full bg-[#eef2ff] px-2 py-1 text-[8px] font-bold text-[#001cac]">
                        Animation {product.featuredAnimationEnabled ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={"/admin/products/" + product.id + "/edit"}
                      className="grid h-10 min-w-10 place-items-center rounded-full border border-[#d7dbe1] bg-white px-3 text-[8px] font-bold text-[#444b55]"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(product.id, -1)}
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#d7dbe1] bg-white text-[14px] font-bold disabled:opacity-25"
                      aria-label={`Move ${product.name} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === featured.length - 1}
                      onClick={() => move(product.id, 1)}
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#d7dbe1] bg-white text-[14px] font-bold disabled:opacity-25"
                      aria-label={`Move ${product.name} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeatured(product.id, false)}
                      className="min-h-10 rounded-full border border-[#efcdcd] bg-white px-3 text-[9px] font-bold text-[#a33d3d]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 grid min-h-[160px] place-items-center rounded-[15px] bg-[#f6f7f8] px-5 text-center">
            <div>
              <strong className="text-[12px] font-semibold">No featured items yet</strong>
              <p className="mt-1.5 text-[9px] leading-4 text-[#737b86]">
                Choose products below. Only active products with an image will
                appear on the storefront.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#727985]">
              Product catalog
            </p>
            <h3 className="mt-1 text-[22px] font-semibold tracking-[-.04em]">
              Choose featured products
            </h3>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="h-[44px] w-full rounded-[12px] border border-[#d7dbe1] bg-[#f7f7f7] px-4 text-[10px] outline-none focus:border-[#111111] focus:bg-white sm:w-[320px]"
          />
        </div>

        {filtered.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => {
              const image = productImage(product);
              const ready = isReady(product);

              return (
                <article
                  key={product.id}
                  className={
                    "overflow-hidden rounded-[16px] border bg-white " +
                    (product.featured
                      ? "border-[#001cac]/35"
                      : "border-[#e0e3e8]")
                  }
                >
                  <div className="flex gap-3 p-3">
                    <div className="h-[72px] w-[62px] shrink-0 overflow-hidden rounded-[10px] bg-[#efefef]">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-[7px] font-bold uppercase text-black/30">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-[11px] font-semibold">
                        {product.name}
                      </strong>
                      <span className="mt-1 block truncate text-[8px] text-[#747c87]">
                        {product.sku} · {product.status}
                      </span>

                      <button
                        type="button"
                        disabled={!product.featured && !hasFeatureImage(product)}
                        onClick={() =>
                          setFeatured(product.id, !product.featured)
                        }
                        className={
                          "mt-3 min-h-[38px] rounded-full px-4 text-[9px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 " +
                          (product.featured
                            ? "border border-[#efcdcd] bg-white text-[#a33d3d]"
                            : "bg-[#111111] text-white")
                        }
                      >
                        {product.featured ? "Remove" : "Add to featured"}
                      </button>
                    </div>
                  </div>

                  {!ready ? (
                    <div className="border-t border-[#eceef1] bg-[#fff8ef] px-3 py-2 text-[8px] font-semibold text-[#8b5a20]">
                      {!hasFeatureImage(product)
                        ? "Upload a product image before featuring it."
                        : "Adding this item to Featured will publish it as Active."}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[15px] bg-[#f6f7f8] px-4 py-8 text-center text-[10px] font-semibold text-[#68717c]">
            No products match this search.
          </div>
        )}
      </section>
    </div>
  );
}
