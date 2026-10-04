import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createAnnouncement,
  listAnnouncements,
  type AnnouncementInput,
} from "@/lib/mongodb-announcements";

export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalDate(value: unknown) {
  const raw = text(value);
  return raw || null;
}

function parse(body: Record<string, unknown>): AnnouncementInput {
  const parsedSortOrder = Number(body.sortOrder);
  return {
    text: text(body.text),
    linkLabel: text(body.linkLabel),
    linkHref: text(body.linkHref),
    startsAt: optionalDate(body.startsAt),
    endsAt: optionalDate(body.endsAt),
    enabled: body.enabled !== false,
    sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 100,
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ announcements: await listAnnouncements() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load announcements." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parse(body);

    if (!input.text) {
      return NextResponse.json({ error: "Announcement text is required." }, { status: 400 });
    }

    if (input.linkLabel && !input.linkHref) {
      return NextResponse.json({ error: "Add a link URL when link label is set." }, { status: 400 });
    }

    const announcement = await createAnnouncement(input);
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create announcement." },
      { status: 500 },
    );
  }
}
