import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteStorageObjects,
  isProductDatabaseConfigured,
  uploadProductImage,
} from "@/lib/supabase-products";

export const dynamic = "force-dynamic";

function slug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general";
}

function safeName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  return cleaned || "image.jpg";
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
    const form = await request.formData();
    const file = form.get("file");
    const productId = String(form.get("productId") ?? "").trim();
    const color = String(form.get("color") ?? "general");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }
    if (!productId || !/^[a-zA-Z0-9-]{8,80}$/.test(productId)) {
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 8 MB or smaller." }, { status: 400 });
    }

    const path = `${productId}/${slug(color)}/${Date.now()}-${safeName(file.name)}`;
    const uploaded = await uploadProductImage(
      path,
      await file.arrayBuffer(),
      file.type || "application/octet-stream",
    );

    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image upload failed." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
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
    const body = (await request.json()) as { path?: string };
    const path = body.path?.trim() ?? "";
    if (!path || path.includes("..") || path.startsWith("/")) {
      return NextResponse.json({ error: "Invalid storage path." }, { status: 400 });
    }

    await deleteStorageObjects([path]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete image." },
      { status: 500 },
    );
  }
}
