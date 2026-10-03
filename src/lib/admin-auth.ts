import {
  createHash,
  createHmac,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminEnvironment } from "@/lib/server-env";

export const ADMIN_SESSION_COOKIE = "kleid_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

type AdminAuthConfig = {
  email: string;
  sessionSecret: string;
  password?: string;
  passwordSalt?: string;
  passwordHash?: string;
};

function getDevelopmentSessionSecret(
  email: string,
  password?: string,
  passwordHash?: string,
) {
  return createHash("sha256")
    .update(
      [
        "kleid-admin-local-session",
        email,
        password ?? "",
        passwordHash ?? "",
      ].join(":"),
    )
    .digest("hex");
}

function readAdminConfig(): AdminAuthConfig | null {
  const env = getAdminEnvironment();
  if (!env) return null;

  const {
    email,
    password,
    passwordSalt,
    passwordHash,
    sessionSecret: configuredSecret,
  } = env;

  const hasPlainPassword = Boolean(password);
  const hasHashedPassword = Boolean(passwordSalt && passwordHash);

  if (!hasPlainPassword && !hasHashedPassword) {
    return null;
  }

  // Local development only: allow ADMIN_EMAIL + ADMIN_PASSWORD to be enough.
  // Production should always use a separate long ADMIN_SESSION_SECRET.
  const sessionSecret =
    configuredSecret && configuredSecret.length >= 32
      ? configuredSecret
      : process.env.NODE_ENV !== "production"
        ? getDevelopmentSessionSecret(email, password, passwordHash)
        : "";

  if (!sessionSecret) return null;

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
    const candidateHash = scryptSync(
      password,
      config.passwordSalt,
      64,
    ).toString("hex");

    return safeEqual(candidateHash, config.passwordHash);
  }

  if (config.password) {
    return safeEqual(password, config.password);
  }

  return false;
}

function signSession(email: string, expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`${email}:${expiresAt}:kleid-admin-session-v5`)
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
    verifyPassword(password, config)
  );
}

export function getAdminSessionValue() {
  const config = readAdminConfig();

  if (!config) {
    throw new Error(
      "Admin authentication is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD. In production also set ADMIN_SESSION_SECRET.",
    );
  }

  const expiresAt =
    Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;

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
