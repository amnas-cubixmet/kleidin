export type AdminEnvironment = {
  email: string;
  password?: string;
  passwordSalt?: string;
  passwordHash?: string;
  sessionSecret?: string;
};

export function getAdminEnvironment(): AdminEnvironment | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const passwordSalt = process.env.ADMIN_PASSWORD_SALT?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!email) return null;

  return {
    email,
    password: password || undefined,
    passwordSalt: passwordSalt || undefined,
    passwordHash: passwordHash || undefined,
    sessionSecret: sessionSecret || undefined,
  };
}


export type SupabaseServerEnvironment = {
  url: string;
  serviceRoleKey: string;
};

export function getSupabaseServerEnvironment(): SupabaseServerEnvironment | null {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) return null;

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
  };
}
