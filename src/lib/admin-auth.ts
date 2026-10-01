import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "kleid_admin_session";

function getAdminPassword() {
  return process.env.KLEID_ADMIN_PASSWORD?.trim() ?? "";
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

export function getAdminSessionValue() {
  const password = getAdminPassword();
  if (!password) return "";

  return createHmac("sha256", password)
    .update("kleid-admin-session-v1")
    .digest("hex");
}

export function verifyAdminPassword(input: string) {
  const password = getAdminPassword();
  if (!password || !input) return false;

  const expected = Buffer.from(password);
  const received = Buffer.from(input);

  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated() {
  const expected = getAdminSessionValue();
  if (!expected) return false;

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === expected;
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
