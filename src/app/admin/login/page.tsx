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
    <main className="min-h-screen bg-[#f4f0e9] px-3 py-6 text-[#111] sm:px-5">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[520px] items-center">
        <section className="w-full rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,.08)] sm:p-7">
          <p className="m-0 text-[8px] font-semibold tracking-[.16em] text-[#001cac]">
            KLEID.IN ADMIN
          </p>

          <h1 className="mt-3 text-[clamp(38px,11vw,62px)] font-semibold leading-[.9] tracking-[-.055em]">
            Welcome back.
          </h1>

          <p className="mt-4 max-w-[420px] text-[10px] leading-5 text-black/50">
            Sign in with your admin email and password to manage the store.
          </p>

          {!configured || params.setup ? (
            <div className="mt-5 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-800">
              Admin login is not configured on this server yet. Add the private
              admin environment variables, then restart or redeploy the app.
            </div>
          ) : params.error ? (
            <div className="mt-5 rounded-[14px] border border-red-200 bg-red-50 p-3 text-[10px] text-red-700">
              Email or password is incorrect.
            </div>
          ) : null}

          <form action={loginAdmin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[8px] font-semibold uppercase tracking-[.1em] text-black/45">
                Email
              </span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                className="h-12 w-full rounded-[12px] border border-black/10 bg-[#fafafa] px-4 text-[14px] outline-none transition focus:border-[#001cac]"
                placeholder="admin@kleid.in"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[8px] font-semibold uppercase tracking-[.1em] text-black/45">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="h-12 w-full rounded-[12px] border border-black/10 bg-[#fafafa] px-4 text-[14px] outline-none transition focus:border-[#001cac]"
                placeholder="Enter your password"
              />
            </label>

            <button
              type="submit"
              className="min-h-12 w-full rounded-full bg-[#111] px-5 text-[10px] font-semibold text-white transition hover:bg-[#001cac] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!configured}
            >
              {configured ? "Sign in to admin" : "Admin setup required"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
