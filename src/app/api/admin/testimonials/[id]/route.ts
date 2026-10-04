import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteTestimonial,
  updateTestimonialModeration,
} from "@/lib/mongodb-testimonials";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { enabled?: boolean; pending?: boolean };
    const testimonial = await updateTestimonialModeration(id, {
      enabled: Boolean(body.enabled),
      pending: Boolean(body.pending),
    });

    if (!testimonial) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update review." },
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
    await deleteTestimonial(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete review." },
      { status: 500 },
    );
  }
}
