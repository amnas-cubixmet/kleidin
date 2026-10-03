import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { demoAdminProducts } from "@/data/demo-admin-products";
import {
  createProduct,
  isProductDatabaseConfigured,
  listProducts,
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
    const image = text(row.image) || images[0] || undefined;

    result.push({
      name,
      value: text(row.value) || "#111111",
      ...(image ? { image } : {}),
      images,
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
    id: text(body.id) || undefined,
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
    tryOnImage: text(body.tryOnImage) || null,
    sortOrder: Math.floor(number(body.sortOrder, 100)),
  };
}

function validate(input: ProductWriteInput) {
  if (!input.name || !input.slug || !input.sku) {
    return "Product name, slug and SKU are required.";
  }
  if (input.price < 0) return "Retail price must be valid.";
  if (input.offerEnabled) {
    if (!input.offerValue || input.offerValue <= 0) {
      return "Enter a valid offer value.";
    }
    if (input.offerType === "percentage" && input.offerValue > 100) {
      return "Percentage discount cannot be above 100%.";
    }
    if (input.offerType === "sale-price" && input.offerValue >= input.price) {
      return "Sale price must be lower than the retail price.";
    }
    if (
      input.offerStartsAt &&
      input.offerEndsAt &&
      new Date(input.offerEndsAt).getTime() <= new Date(input.offerStartsAt).getTime()
    ) {
      return "Offer end time must be after the start time.";
    }
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

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isProductDatabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      demo: true,
      products: demoAdminProducts,
    });
  }

  try {
    return NextResponse.json({
      configured: true,
      products: await listProducts(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load products." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseProduct(body);
    const error = validate(input);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const product = await createProduct(input);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create product." },
      { status: 500 },
    );
  }
}
