import type { Metadata } from "next";
import Link from "next/link";
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
    <main className="min-h-screen bg-white text-[#111]">
      <header className="flex h-[64px] w-full items-center justify-between border-b border-black/10 px-4 sm:px-6 md:px-8">
        <Link
          href="/"
          className="text-[20px] font-extrabold tracking-[-.055em] text-[#111]"
        >
          KLEID.IN
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[8px] font-semibold tracking-[.14em] text-black/40">
            ADMIN
          </span>
          <Link
            href="/"
            className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-[8px] font-semibold text-[#111]"
          >
            View store
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1440px] md:grid-cols-[.92fr_1.08fr]">
        <div className="flex min-h-[300px] flex-col justify-between bg-[#001cac] p-5 text-white sm:p-7 md:min-h-[calc(100vh-64px)] md:p-10 lg:p-14">
          <p className="m-0 text-[8px] font-semibold tracking-[.16em] text-white/55">
            KLEID.IN / STORE ADMIN
          </p>

          <div className="max-w-[620px]">
            <h1 className="m-0 text-[clamp(46px,7vw,92px)] font-semibold leading-[.86] tracking-[-.065em]">
              Store
              <br />
              control.
            </h1>

            <p className="mt-6 max-w-[470px] text-[10px] leading-5 text-white/60 md:text-[11px]">
              Sign in to manage products, hero content, customer stories and
              dealer-facing store updates.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[7px] text-white/45 md:mt-10">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            <span>PRIVATE ADMIN ACCESS</span>
          </div>
        </div>

        <div className="flex items-center bg-white px-4 py-9 sm:px-7 md:px-10 lg:px-16">
          <section className="w-full max-w-[560px] md:mx-auto">
            <div className="border-b border-black/10 pb-6">
              <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
                SECURE ACCESS
              </p>
              <h2 className="mt-3 text-[clamp(34px,5vw,56px)] font-semibold leading-[.92] tracking-[-.055em]">
                Welcome back.
              </h2>
              <p className="mt-4 max-w-[430px] text-[10px] leading-5 text-black/50">
                Use your admin email and password to continue.
              </p>
            </div>

            {!configured || params.setup ? (
              <div className="mt-5 border border-amber-300 bg-[#fffaf0] px-4 py-3 text-[9px] leading-5 text-amber-800">
                Admin login is not configured on this server yet. Add the
                private admin environment variables, then restart or redeploy
                the app.
              </div>
            ) : params.error ? (
              <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-[9px] leading-5 text-red-700">
                Email or password is incorrect.
              </div>
            ) : null}

            <form action={loginAdmin} className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/45">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  className="h-[50px] w-full border border-black/15 bg-white px-4 text-[14px] outline-none transition focus:border-[#001cac] focus:ring-1 focus:ring-[#001cac]"
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
                  className="h-[50px] w-full border border-black/15 bg-white px-4 text-[14px] outline-none transition focus:border-[#001cac] focus:ring-1 focus:ring-[#001cac]"
                  placeholder="Enter your password"
                />
              </label>

              <button
                type="submit"
                className="mt-1 min-h-[48px] w-full rounded-full bg-black px-5 text-[9px] font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black disabled:text-white disabled:opacity-100"
                disabled={!configured}
              >
                {configured ? "Sign in to admin" : "Admin setup required"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4 text-[7px] text-black/35">
              <span>KLEID.IN ADMIN</span>
              <span>PRIVATE ACCESS</span>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
