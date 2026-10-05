import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  isProductDatabaseConfigured,
  listProducts,
  updateFeaturedProducts,
} from "@/lib/mongodb-products";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isProductDatabaseConfigured()) {
    return NextResponse.json(
      { error: "MongoDB Atlas product database is not configured." },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json({ products: await listProducts() });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load featured products.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isProductDatabaseConfigured()) {
    return NextResponse.json(
      { error: "MongoDB Atlas product database is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      items?: Array<{
        id?: unknown;
        featured?: unknown;
        featuredSortOrder?: unknown;
      }>;
    };

    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Featured product items are required." },
        { status: 400 },
      );
    }

    const items = body.items
      .map((item, index) => ({
        id: typeof item.id === "string" ? item.id.trim() : "",
        featured: item.featured === true,
        featuredSortOrder: Number.isFinite(Number(item.featuredSortOrder))
          ? Math.max(1, Math.floor(Number(item.featuredSortOrder)))
          : (index + 1) * 10,
      }))
      .filter((item) => Boolean(item.id));

    const products = await updateFeaturedProducts(items);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save featured products.",
      },
      { status: 500 },
    );
  }
}
