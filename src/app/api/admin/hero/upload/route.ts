import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteCloudinaryImage,
  isCloudinaryConfigured,
  uploadCloudinaryImage,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
    const form = await request.formData();
    const file = form.get("file");
    const heroId = String(form.get("heroId") ?? "new-hero").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 12 MB or smaller." }, { status: 400 });
    }

    const asset = await uploadCloudinaryImage({
      bytes: await file.arrayBuffer(),
      contentType: file.type,
      filename: file.name,
      folder: `kleidin/hero/${heroId.replace(/[^a-zA-Z0-9-]+/g, "-")}`,
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hero image upload failed." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      { error: error instanceof Error ? error.message : "Could not delete hero image." },
      { status: 500 },
    );
  }
}
