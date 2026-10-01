import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "kleid_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

type AdminAuthConfig = {
  email: string;
  password: string;
  sessionSecret: string;
};

function readAdminConfig(): AdminAuthConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!email || !password || !sessionSecret) {
    return null;
  }

  if (sessionSecret.length < 32) {
    return null;
  }

  return {
    email,
    password,
    sessionSecret,
  };
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function signSession(email: string, expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`${email}:${expiresAt}:kleid-admin-session-v4`)
    .digest("hex");
}

export function isAdminAuthConfigured() {
  return readAdminConfig() !== null;
}

export function verifyAdminCredentials(email: string, password: string) {
  const config = readAdminConfig();
  if (!config) return false;

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return false;

  return (
    safeEqual(normalizedEmail, config.email) &&
    safeEqual(password, config.password)
  );
}

export function getAdminSessionValue() {
  const config = readAdminConfig();

  if (!config) {
    throw new Error(
      "Admin authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET in .env.local.",
    );
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const signature = signSession(
    config.email,
    expiresAt,
    config.sessionSecret,
  );

  return `${expiresAt}.${signature}`;
}

export async function isAdminAuthenticated() {
  const config = readAdminConfig();
  if (!config) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return false;

  const [expiresText, signature] = value.split(".");
  const expiresAt = Number(expiresText);

  if (
    !expiresText ||
    !signature ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const expected = signSession(
    config.email,
    expiresAt,
    config.sessionSecret,
  );

  return safeEqual(signature, expected);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
