import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteCloudinaryImage,
  getSignedCloudinaryUpload,
  isCloudinaryConfigured,
  uploadCloudinaryImage,
} from "@/lib/cloudinary";
import { isProductDatabaseConfigured } from "@/lib/mongodb-products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function slug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general"
  );
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId")?.trim() ?? "";
  const group = url.searchParams.get("group")?.trim() || "general";

  if (!productId || !/^[a-zA-Z0-9-]{8,100}$/.test(productId)) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  const folder = `kleidin/products/${slug(productId)}/${slug(group)}`;

  try {
    return NextResponse.json(getSignedCloudinaryUpload(folder));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not prepare image upload." },
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
      { error: "MongoDB Atlas product database is not configured." },
      { status: 503 },
    );
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const productId = String(form.get("productId") ?? "").trim();
    const group = String(form.get("color") ?? "general");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }

    if (!productId || !/^[a-zA-Z0-9-]{8,100}$/.test(productId)) {
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 10 MB or smaller." }, { status: 400 });
    }

    const uploaded = await uploadCloudinaryImage({
      bytes: await file.arrayBuffer(),
      contentType: file.type || "application/octet-stream",
      filename: file.name,
      folder: `kleidin/products/${slug(productId)}/${slug(group)}`,
    });

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

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { publicId?: string };
    const publicId = body.publicId?.trim() ?? "";

    if (!publicId) {
      return NextResponse.json({ error: "Cloudinary public ID is required." }, { status: 400 });
    }

    await deleteCloudinaryImage(publicId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete image." },
      { status: 500 },
    );
  }
}
