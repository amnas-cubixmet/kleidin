import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getDemoModeEnabled,
  setDemoModeEnabled,
} from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ enabled: await getDemoModeEnabled() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { enabled?: unknown };
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be true or false." },
        { status: 400 },
      );
    }

    const enabled = await setDemoModeEnabled(body.enabled);

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return NextResponse.json({ enabled });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update demo mode.",
      },
      { status: 500 },
    );
  }
}
