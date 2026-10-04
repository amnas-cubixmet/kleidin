import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  getAdminSessionValue,
  isAdminAuthConfigured,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "login");

  if (intent === "logout") {
    const response = redirectTo(request, "/admin/login");
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (!isAdminAuthConfigured()) {
    return redirectTo(request, "/admin/login?setup=1");
  }

  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (!verifyAdminCredentials(email, password)) {
    return redirectTo(request, "/admin/login?error=1");
  }

  const response = redirectTo(request, "/admin");
  response.cookies.set(ADMIN_SESSION_COOKIE, getAdminSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
