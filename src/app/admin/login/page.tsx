import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAdmin } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import PasswordField from "./PasswordField";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{
    setup?: string;
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  if (await isAdminAuthenticated()) redirect("/admin");

  const params = await searchParams;
  const setupMissing = params.setup === "1";
  const invalidCredentials = params.error === "1";

  return (
    <main className="grid min-h-screen w-full place-items-center bg-white px-4 py-8 text-[#111]">
      <section className="w-full max-w-[460px]">
        <div className="w-full px-1 py-3 sm:px-3 md:px-5">
          <div className="mb-9 text-center">
            <strong className="block text-[22px] font-extrabold tracking-[-.055em]">
              KLEID.IN
            </strong>
            <span className="mt-2 block text-[7px] font-semibold tracking-[.16em] text-black/35">
              ADMIN ACCESS
            </span>

            <h1 className="mt-8 text-[clamp(38px,10vw,54px)] font-semibold leading-[.92] tracking-[-.055em]">
              Welcome back.
            </h1>
          </div>

          {setupMissing ? (
            <div className="mb-5 border border-[#e0b35a] bg-[#fff9eb] px-4 py-3 text-[9px] leading-4 text-[#6c4a0b]">
              Admin login is not configured yet. For local development add
              ADMIN_EMAIL and ADMIN_PASSWORD to{" "}
              <code className="mx-1">.env.local</code>, then restart the dev
              server. For production also add a long ADMIN_SESSION_SECRET.
            </div>
          ) : null}

          {invalidCredentials ? (
            <div className="mb-5 border border-[#d9a4a4] bg-[#fff3f3] px-4 py-3 text-[9px] leading-4 text-[#7b1f1f]">
              Email or password is incorrect.
            </div>
          ) : null}

          <form action={loginAdmin} className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/45">
                Email
              </span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                className="h-[52px] w-full border border-black/20 bg-white px-4 text-[14px] text-[#111] outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                placeholder="admin@kleid.in"
              />
            </label>

            <PasswordField />

            <button
              type="submit"
              className="admin-login-submit mt-1 min-h-[50px] w-full rounded-full border border-[#111] bg-[#111] px-5 text-[10px] font-semibold transition"
              style={{ backgroundColor: "#111111", color: "#ffffff" }}
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center text-[8px] leading-4 text-black/40">
            Secure admin session is stored in an HTTP-only cookie for 12 hours.
          </p>
        </div>
      </section>
    </main>
  );
}
