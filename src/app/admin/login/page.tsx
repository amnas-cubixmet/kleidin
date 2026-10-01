import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAdmin } from "@/app/admin/actions";
import {
  isAdminAuthConfigured,
  isAdminAuthenticated,
} from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; setup?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  if (await isAdminAuthenticated()) redirect("/admin");

  const params = await searchParams;
  const configured = isAdminAuthConfigured();

  return (
    <main className="grid min-h-screen w-full place-items-center bg-[#f5f5f2] px-4 py-8 text-[#111]">
      <section className="w-full max-w-[420px]">
        <div className="rounded-[24px] border border-black/8 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,.06)] sm:p-7 md:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <strong className="text-[20px] font-extrabold tracking-[-.055em]">
                KLEID.IN
              </strong>
              <span className="text-[7px] font-semibold tracking-[.14em] text-black/35">
                ADMIN
              </span>
            </div>

            <div className="mt-10">
              <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
                PRIVATE ACCESS
              </p>
              <h1 className="mt-3 text-[clamp(36px,10vw,50px)] font-semibold leading-[.9] tracking-[-.055em]">
                Sign in.
              </h1>
              <p className="mt-4 text-[10px] leading-5 text-black/45">
                Enter your local admin email and password.
              </p>
            </div>
          </div>

          {!configured || params.setup ? (
            <div className="mb-5 rounded-[12px] border border-amber-200 bg-[#fffaf0] px-4 py-3 text-[9px] leading-5 text-amber-800">
              Admin login is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD
              and ADMIN_SESSION_SECRET to your .env.local file, then restart
              the dev server.
            </div>
          ) : params.error ? (
            <div className="mb-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[9px] leading-5 text-red-700">
              Email or password is incorrect.
            </div>
          ) : null}

          <form action={loginAdmin} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/45">
                Email
              </span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                className="h-[50px] w-full rounded-[12px] border border-black/12 bg-white px-4 text-[14px] outline-none transition focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10"
                placeholder="admin@kleid.in"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/45">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="h-[50px] w-full rounded-[12px] border border-black/12 bg-white px-4 text-[14px] outline-none transition focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10"
                placeholder="Enter password"
              />
            </label>

            <button
              type="submit"
              className="mt-2 min-h-[48px] w-full rounded-full bg-[#111] px-5 text-[9px] font-semibold text-white transition hover:bg-[#001cac] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!configured}
            >
              {configured ? "Sign in to admin" : "Setup required"}
            </button>
          </form>

          <p className="mt-6 border-t border-black/8 pt-4 text-center text-[7px] leading-4 text-black/30">
            Local admin access · Session expires after 12 hours
          </p>
        </div>
      </section>
    </main>
  );
}
