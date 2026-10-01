import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "kleid_admin_session";

const ADMIN_EMAIL = "admin@kleid.in";
const ADMIN_PASSWORD_HASH =
  "2ddfe53b59d4b266f669bd16582ea3dfaa5ddaebb4143c59ea9f57283edbdd82";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return false;

  const emailMatches = safeEqual(normalizedEmail, ADMIN_EMAIL);
  const passwordMatches = safeEqual(hashPassword(password), ADMIN_PASSWORD_HASH);

  return emailMatches && passwordMatches;
}

export function getAdminSessionValue() {
  return createHmac("sha256", ADMIN_PASSWORD_HASH)
    .update(`${ADMIN_EMAIL}:kleid-admin-session-v2`)
    .digest("hex");
}

export async function isAdminAuthenticated() {
  const expected = getAdminSessionValue();
  const cookieStore = await cookies();

  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === expected;
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
