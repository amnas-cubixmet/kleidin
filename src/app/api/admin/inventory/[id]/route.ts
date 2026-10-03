import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getProduct,
  isProductDatabaseConfigured,
  updateProduct,
} from "@/lib/supabase-products";
import type { ProductColorVariant } from "@/types/product";

export const dynamic = "force-dynamic";

function stockNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isProductDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase product database is not configured." },
      { status: 503 },
    );
  }

  try {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      stock?: unknown;
      colorStocks?: Record<string, unknown>;
    };

    const colorStocks = body.colorStocks ?? {};
    const colorVariants: ProductColorVariant[] = (product.colorVariants ?? []).map(
      (variant) => ({
        ...variant,
        stock:
          Object.prototype.hasOwnProperty.call(colorStocks, variant.name)
            ? stockNumber(colorStocks[variant.name])
            : stockNumber(variant.stock),
      }),
    );

    const variantTotal = colorVariants.reduce(
      (sum, variant) => sum + stockNumber(variant.stock),
      0,
    );

    const requestedStock =
      body.stock === undefined ? product.stock : stockNumber(body.stock);
    const nextStock =
      colorVariants.length && Object.keys(colorStocks).length
        ? variantTotal
        : requestedStock;

    const nextStatus =
      nextStock === 0
        ? "sold-out"
        : product.status === "sold-out"
          ? "active"
          : product.status;

    const updated = await updateProduct(id, {
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      wholesaleSlug: product.wholesaleSlug ?? null,
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? null,
      offerEnabled: Boolean(product.offerEnabled),
      offerType: product.offerType ?? "sale-price",
      offerValue: product.offerValue ?? null,
      offerLabel: product.offerLabel ?? null,
      offerBadge: product.offerBadge ?? null,
      offerStartsAt: product.offerStartsAt ?? null,
      offerEndsAt: product.offerEndsAt ?? null,
      offerCountdown: Boolean(product.offerCountdown),
      wholesaleEnabled: Boolean(product.wholesaleEnabled),
      wholesalePrice: product.wholesalePrice ?? null,
      wholesaleMinOrder: product.wholesaleMinOrder ?? null,
      description: product.description,
      sizes: product.sizes,
      colors: product.colors,
      colorVariants,
      stock: nextStock,
      featured: product.featured,
      status: nextStatus,
      image: product.image ?? null,
      tryOnImage: product.tryOnImage ?? null,
      sortOrder: product.sortOrder ?? 100,
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update inventory.",
      },
      { status: 500 },
    );
  }
}
