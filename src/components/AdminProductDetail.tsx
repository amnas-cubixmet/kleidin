"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { getProductOfferPrice, getProductOfferStatus } from "@/lib/product-offers";

function money(value?: number) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminProductDetail({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/products/" + productId, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load product.");
        return data.product as Product;
      })
      .then((value) => {
        if (active) setProduct(value);
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
  }, [productId]);

  async function removeProduct() {
    if (!product) return;
    const confirmed = window.confirm(
      "Delete this product? The database record and product images in storage will be removed.",
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setMessage("");
      const response = await fetch("/api/admin/products/" + product.id, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete product.");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete product.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white text-[11px] font-semibold text-[#6b7380]">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="grid min-h-[340px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white px-5 text-center">
        <div>
          <strong className="text-[15px] font-semibold">Product not found</strong>
          <p className="mt-2 text-[10px] leading-5 text-[#69717c]">
            {message || "This product may have been deleted."}
          </p>
          <Link
            href="/admin/products"
            className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[#111111] px-5 text-[10px] font-bold text-white"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const preview =
    product.image ||
    product.colorVariants?.[0]?.images?.[0] ||
    product.colorVariants?.[0]?.image;
  const offerStatus = getProductOfferStatus(product);
  const offerPrice = getProductOfferPrice(product);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
      <div className="grid content-start gap-4">
        <section className="overflow-hidden rounded-[20px] border border-[#d9dde3] bg-white shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px]">
          <div className="grid md:grid-cols-[minmax(260px,.85fr)_minmax(0,1.15fr)]">
            <div className="min-h-[280px] bg-[#f3f3f3]">
              {preview ? (
                <img
                  src={preview}
                  alt={product.name}
                  className="h-full min-h-[280px] w-full object-cover"
                />
              ) : (
                <div className="grid h-full min-h-[280px] place-items-center text-[11px] font-semibold text-[#8a919b]">
                  No product image
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#111111] px-3 py-1.5 text-[8px] font-bold text-white">
                  {product.status}
                </span>
                {product.featured ? (
                  <span className="rounded-full bg-[#ededed] px-3 py-1.5 text-[8px] font-bold text-[#444b54]">
                    Featured
                  </span>
                ) : null}
                {product.wholesaleEnabled ? (
                  <span className="rounded-full bg-[#ededed] px-3 py-1.5 text-[8px] font-bold text-[#444b54]">
                    Wholesale enabled
                  </span>
                ) : null}
                {product.offerEnabled ? (
                  <span className="rounded-full bg-[#111111] px-3 py-1.5 text-[8px] font-bold !text-white" style={{ color: "#fff" }}>
                    Offer · {offerStatus}
                  </span>
                ) : null}
              </div>

              <h2 className="mt-4 text-[28px] font-semibold tracking-[-.045em] sm:text-[34px]">
                {product.name}
              </h2>
              <p className="mt-2 text-[10px] font-medium text-[#707884]">
                {product.sku} · {product.category}
              </p>
              <p className="mt-4 text-[11px] leading-6 text-[#4f5762]">
                {product.description || "No description added."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-[16px] bg-[#f5f5f5] p-4">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#777f89]">
                    Retail price
                  </span>
                  <strong className="mt-1.5 block text-[19px]">
                    {money(product.price)}
                  </strong>
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#777f89]">
                    Stock
                  </span>
                  <strong className="mt-1.5 block text-[19px]">
                    {product.stock}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:rounded-[22px] sm:p-5 md:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
            Colours & media
          </p>
          <h3 className="mt-1.5 text-[23px] font-semibold tracking-[-.04em]">
            Variants
          </h3>

          {product.colorVariants?.length ? (
            <div className="mt-4 grid gap-3">
              {product.colorVariants.map((variant) => {
                const images = variant.images?.length
                  ? variant.images
                  : variant.image
                    ? [variant.image]
                    : [];

                return (
                  <div
                    key={variant.name}
                    className="rounded-[16px] border border-[#d9dde3] bg-[#f8f8f8] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-8 w-8 rounded-full border border-black/10"
                          style={{ backgroundColor: variant.value || "#111111" }}
                        />
                        <div>
                          <strong className="block text-[12px] font-semibold">
                            {variant.name}
                          </strong>
                          <span className="mt-0.5 block text-[9px] text-[#737b86]">
                            Stock {variant.stock ?? 0}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-[#6a727d]">
                        {images.length} image{images.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {images.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {images.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt={variant.name}
                            className="aspect-square w-full rounded-[12px] border border-[#d9dde3] bg-white object-cover"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-[16px] bg-[#f5f5f5] p-4 text-[10px] text-[#707884]">
              No colour variants configured.
            </div>
          )}
        </section>
      </div>

      <aside className="grid content-start gap-4">
        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:rounded-[22px] sm:p-5">
          <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
            Pricing
          </p>

          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#656e79]">Retail price</span>
              <strong className="text-[12px]">{money(product.price)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#656e79]">Old price</span>
              <strong className="text-[12px]">
                {money(product.compareAtPrice)}
              </strong>
            </div>
            <div className="border-t border-[#e5e7ea] pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold text-[#454d57]">
                  Offer
                </span>
                <strong className="text-[11px] capitalize">
                  {product.offerEnabled ? offerStatus : "Off"}
                </strong>
              </div>
            </div>
            {product.offerEnabled ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#656e79]">Offer price</span>
                  <strong className="text-[12px]">{money(offerPrice)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#656e79]">Offer label</span>
                  <strong className="max-w-[160px] truncate text-right text-[11px]">
                    {product.offerBadge || product.offerLabel || "Offer"}
                  </strong>
                </div>
                <div className="grid gap-1 rounded-[12px] bg-[#f5f5f5] p-3 text-[9px] text-[#69717c]">
                  <span>Start: {product.offerStartsAt ? new Date(product.offerStartsAt).toLocaleString("en-IN") : "Always"}</span>
                  <span>End: {product.offerEndsAt ? new Date(product.offerEndsAt).toLocaleString("en-IN") : "No expiry"}</span>
                  <span>Countdown: {product.offerCountdown ? "On" : "Off"}</span>
                </div>
              </>
            ) : null}
            <div className="border-t border-[#e5e7ea] pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold text-[#454d57]">
                  Wholesale
                </span>
                <strong className="text-[11px]">
                  {product.wholesaleEnabled ? "On" : "Off"}
                </strong>
              </div>
            </div>
            {product.wholesaleEnabled ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#656e79]">
                    Wholesale price
                  </span>
                  <strong className="text-[12px]">
                    {money(product.wholesalePrice)}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#656e79]">
                    Minimum quantity
                  </span>
                  <strong className="text-[12px]">
                    {product.wholesaleMinOrder ?? "—"}
                  </strong>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:rounded-[22px] sm:p-5">
          <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
            Product setup
          </p>
          <div className="mt-4 grid gap-3 text-[10px] text-[#616a75]">
            <div className="flex justify-between gap-3">
              <span>Slug</span>
              <strong className="max-w-[190px] truncate text-[#2e333a]">
                /{product.slug}
              </strong>
            </div>
            <div className="flex justify-between gap-3">
              <span>Sizes</span>
              <strong className="text-right text-[#2e333a]">
                {product.sizes.join(", ") || "—"}
              </strong>
            </div>
            <div className="flex justify-between gap-3">
              <span>Colours</span>
              <strong className="text-right text-[#2e333a]">
                {product.colors.join(", ") || "—"}
              </strong>
            </div>
            <div className="flex justify-between gap-3">
              <span>Sort order</span>
              <strong className="text-[#2e333a]">
                {product.sortOrder ?? 100}
              </strong>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:rounded-[22px] sm:p-5">
          <div className="grid gap-2">
            <Link
              href={"/admin/products/" + product.id + "/edit#offer-settings"}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#111111] px-5 text-[10px] font-bold !text-white"
              style={{ color: "#fff" }}
            >
              Manage offer
            </Link>
            <Link
              href={"/admin/products/" + product.id + "/edit"}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#d5d9df] bg-white px-5 text-[10px] font-bold text-[#4d5661]"
            >
              Edit product
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void removeProduct()}
              className="min-h-[46px] rounded-full border border-[#edcaca] bg-white px-5 text-[10px] font-bold text-[#a33d3d] disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete product"}
            </button>
            <Link
              href="/admin/products"
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#d5d9df] bg-[#f5f5f5] px-5 text-[10px] font-bold text-[#4d5661]"
            >
              Back to products
            </Link>
          </div>

          {message ? (
            <p className="mt-3 text-[10px] font-semibold text-[#9a3d3d]">
              {message}
            </p>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
