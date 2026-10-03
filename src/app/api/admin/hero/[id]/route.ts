import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteHeroSlide, updateHeroSlide } from "@/lib/supabase-hero";
import type {
  HeroCtaStyle,
  HeroImagePosition,
  HeroSlideKind,
} from "@/data/hero-slides";

export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parse(body: Record<string, unknown>) {
  const kind = text(body.kind) as HeroSlideKind;
  const ctaStyle = text(body.ctaStyle) as HeroCtaStyle;
  const imagePosition = text(body.imagePosition) as HeroImagePosition;

  return {
    kind: ["product", "offer", "collection", "custom"].includes(kind) ? kind : "custom" as HeroSlideKind,
    productId: text(body.productId) || null,
    label: text(body.label),
    title: text(body.title),
    subtitle: text(body.subtitle),
    button: text(body.button) || "Shop now",
    href: text(body.href),
    badge: text(body.badge),
    discountText: text(body.discountText),
    imageUrl: text(body.imageUrl),
    startsAt: text(body.startsAt) || null,
    endsAt: text(body.endsAt) || null,
    showCountdown: Boolean(body.showCountdown),
    ctaStyle: ["light", "dark", "outline"].includes(ctaStyle) ? ctaStyle : "light",
    imagePosition: ["left", "center", "right"].includes(imagePosition) ? imagePosition : "center",
    enabled: body.enabled !== false,
    order: Math.max(1, Math.floor(number(body.order, 100))),
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const slide = await updateHeroSlide(id, parse(body));
    if (!slide) return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    return NextResponse.json({ slide });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update hero slide." },
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

  try {
    const { id } = await params;
    await deleteHeroSlide(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete hero slide." },
      { status: 500 },
    );
  }
}
