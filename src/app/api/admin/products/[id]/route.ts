import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDemoAdminProduct } from "@/data/demo-admin-products";
import {
  deleteProduct,
  getProduct,
  isProductDatabaseConfigured,
  updateProduct,
  type ProductWriteInput,
} from "@/lib/supabase-products";
import type { ProductColorVariant, ProductOfferType, ProductStatus } from "@/types/product";

export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => text(item)).filter(Boolean)
    : [];
}

function sizeStocks(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, number>;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([size, stock]) => [size.trim(), Math.max(0, Math.floor(number(stock, 0)))])
      .filter(([size]) => Boolean(size)),
  );
}

function variants(value: unknown): ProductColorVariant[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<ProductColorVariant[]>((result, item) => {
    if (!item || typeof item !== "object") return result;

    const row = item as Record<string, unknown>;
    const name = text(row.name);
    if (!name) return result;

    const images = strings(row.images);
    const imagePublicIds = strings(row.imagePublicIds);
    const image = text(row.image) || images[0] || undefined;

    result.push({
      name,
      value: text(row.value) || "#111111",
      ...(image ? { image } : {}),
      images,
      imagePublicIds,
      stock: Math.max(0, number(row.stock, 0)),
      sizeStocks: sizeStocks(row.sizeStocks),
    });

    return result;
  }, []);
}

function parseProduct(body: Record<string, unknown>): ProductWriteInput {
  const wholesaleEnabled = Boolean(body.wholesaleEnabled);
  const offerEnabled = Boolean(body.offerEnabled);
  const offerType = text(body.offerType) as ProductOfferType;
  const status = text(body.status) as ProductStatus;

  return {
    sku: text(body.sku),
    name: text(body.name),
    slug: text(body.slug),
    wholesaleSlug: text(body.wholesaleSlug) || null,
    category: text(body.category) || "Uncategorised",
    price: Math.max(0, number(body.price)),
    compareAtPrice:
      body.compareAtPrice === null || body.compareAtPrice === ""
        ? null
        : Math.max(0, number(body.compareAtPrice)),
    offerEnabled,
    offerType: ["sale-price", "percentage", "fixed"].includes(offerType)
      ? offerType
      : "sale-price",
    offerValue: offerEnabled ? Math.max(0, number(body.offerValue)) : null,
    offerLabel: offerEnabled ? text(body.offerLabel) : null,
    offerBadge: offerEnabled ? text(body.offerBadge) : null,
    offerStartsAt: offerEnabled ? text(body.offerStartsAt) || null : null,
    offerEndsAt: offerEnabled ? text(body.offerEndsAt) || null : null,
    offerCountdown: offerEnabled ? Boolean(body.offerCountdown) : false,
    wholesaleEnabled,
    wholesalePrice: wholesaleEnabled
      ? Math.max(0, number(body.wholesalePrice))
      : null,
    wholesaleMinOrder: wholesaleEnabled
      ? Math.max(1, Math.floor(number(body.wholesaleMinOrder, 1)))
      : null,
    description: text(body.description),
    sizes: strings(body.sizes),
    colors: strings(body.colors),
    colorVariants: variants(body.colorVariants),
    stock: Math.max(0, Math.floor(number(body.stock))),
    featured: Boolean(body.featured),
    status: ["active", "draft", "sold-out"].includes(status) ? status : "draft",
    image: text(body.image) || null,
    imagePublicId: text(body.imagePublicId) || null,
    tryOnImage: text(body.tryOnImage) || null,
    tryOnImagePublicId: text(body.tryOnImagePublicId) || null,
    sortOrder: Math.floor(number(body.sortOrder, 100)),
  };
}

function validate(input: ProductWriteInput) {
  if (!input.name || !input.slug || !input.sku) {
    return "Product name, slug and SKU are required.";
  }
  if (input.wholesaleEnabled) {
    if (!input.wholesalePrice || input.wholesalePrice <= 0) {
      return "Wholesale price is required when wholesale is enabled.";
    }
    if (!input.wholesaleMinOrder || input.wholesaleMinOrder < 1) {
      return "Minimum wholesale quantity must be at least 1.";
    }
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isProductDatabaseConfigured()) {
    const { id } = await params;
    const product = getDemoAdminProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product, demo: true });
  }

  try {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load product." },
      { status: 500 },
    );
  }
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
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseProduct(body);
    const validation = validate(input);
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 });
    }

    const product = await updateProduct(id, input);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
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
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete product." },
      { status: 500 },
    );
  }
}
