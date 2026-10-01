import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "kleid_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

type AdminAuthConfig = {
  email: string;
  passwordSalt: string;
  passwordHash: string;
  sessionSecret: string;
};

function readAdminConfig(): AdminAuthConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordSalt = process.env.ADMIN_PASSWORD_SALT?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim().toLowerCase();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!email || !passwordSalt || !passwordHash || !sessionSecret) {
    return null;
  }

  if (!/^[a-f0-9]{128}$/i.test(passwordHash)) {
    return null;
  }

  if (sessionSecret.length < 32) {
    return null;
  }

  return {
    email,
    passwordSalt,
    passwordHash,
    sessionSecret,
  };
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function signSession(email: string, expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`${email}:${expiresAt}:kleid-admin-session-v3`)
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

  const emailMatches = safeEqual(normalizedEmail, config.email);
  const passwordMatches = safeEqual(
    hashPassword(password, config.passwordSalt),
    config.passwordHash,
  );

  return emailMatches && passwordMatches;
}

export function getAdminSessionValue() {
  const config = readAdminConfig();

  if (!config) {
    throw new Error(
      "Admin authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET.",
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
