import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "kleid_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

type AdminAuthConfig = {
  email: string;
  sessionSecret: string;
  password?: string;
  passwordSalt?: string;
  passwordHash?: string;
};

function readAdminConfig(): AdminAuthConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  const password = process.env.ADMIN_PASSWORD?.trim();
  const passwordSalt = process.env.ADMIN_PASSWORD_SALT?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  const hasPlainPassword = Boolean(password);
  const hasHashedPassword = Boolean(passwordSalt && passwordHash);

  if (!email || !sessionSecret || (!hasPlainPassword && !hasHashedPassword)) {
    return null;
  }

  if (sessionSecret.length < 32) {
    return null;
  }

  return {
    email,
    sessionSecret,
    password,
    passwordSalt,
    passwordHash,
  };
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function verifyPassword(password: string, config: AdminAuthConfig) {
  if (config.passwordSalt && config.passwordHash) {
    const candidateHash = scryptSync(password, config.passwordSalt, 64).toString("hex");
    return safeEqual(candidateHash, config.passwordHash);
  }

  if (config.password) {
    return safeEqual(password, config.password);
  }

  return false;
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

  return safeEqual(normalizedEmail, config.email) && verifyPassword(password, config);
}

export function getAdminSessionValue() {
  const config = readAdminConfig();

  if (!config) {
    throw new Error(
      "Admin authentication is not configured. Set ADMIN_EMAIL, ADMIN_SESSION_SECRET and either ADMIN_PASSWORD or ADMIN_PASSWORD_SALT + ADMIN_PASSWORD_HASH.",
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
