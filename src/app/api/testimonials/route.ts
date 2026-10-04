import { NextResponse } from "next/server";
import {
  createTestimonial,
  listPublishedTestimonials,
} from "@/lib/mongodb-testimonials";
import {
  isCloudinaryConfigured,
  uploadCloudinaryImage,
} from "@/lib/cloudinary";
import { isMongoDatabaseConfigured } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isMongoDatabaseConfigured()) {
    return NextResponse.json({ testimonials: [] });
  }

  try {
    const url = new URL(request.url);
    const productSlug = url.searchParams.get("productSlug")?.trim() || undefined;
    const testimonials = await listPublishedTestimonials(productSlug);
    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load reviews." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isMongoDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Review service is not configured." },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const quote = String(form.get("quote") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const productSlug = String(form.get("productSlug") ?? "").trim();
    const rating = Math.max(1, Math.min(5, Number(form.get("rating")) || 5));
    const file = form.get("productImage");

    if (!name || !quote) {
      return NextResponse.json(
        { error: "Name and your story are required." },
        { status: 400 },
      );
    }

    if (name.length > 100 || quote.length > 1200 || location.length > 120) {
      return NextResponse.json(
        { error: "Review content is too long." },
        { status: 400 },
      );
    }

    let productImage: string | undefined;
    let productImagePublicId: string | undefined;

    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Review photo must be an image." }, { status: 400 });
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Review photo must be 5 MB or smaller." }, { status: 400 });
      }

      if (!isCloudinaryConfigured()) {
        return NextResponse.json(
          { error: "Photo upload is not configured." },
          { status: 503 },
        );
      }

      const asset = await uploadCloudinaryImage({
        bytes: await file.arrayBuffer(),
        contentType: file.type,
        filename: file.name,
        folder: "kleidin/reviews",
      });

      productImage = asset.url;
      productImagePublicId = asset.publicId;
    }

    await createTestimonial({
      name,
      quote,
      location: location || undefined,
      rating,
      productSlug: productSlug || undefined,
      productImage,
      productImagePublicId,
    });

    return NextResponse.json(
      { ok: true, message: "Thank you. Your story was submitted for review." },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit review." },
      { status: 500 },
    );
  }
}
