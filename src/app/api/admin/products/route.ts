import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { demoAdminProducts } from "@/data/demo-admin-products";
import {
  createProduct,
  isProductDatabaseConfigured,
  listProducts,
  type ProductWriteInput,
} from "@/lib/supabase-products";
import type { ProductColorVariant, ProductStatus } from "@/types/product";

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
    });

    return result;
  }, []);
}

function parseProduct(body: Record<string, unknown>): ProductWriteInput {
  const wholesaleEnabled = Boolean(body.wholesaleEnabled);
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
