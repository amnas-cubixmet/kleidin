import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAdmin } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

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
                className="h-[52px] w-full border border-black/15 bg-white px-4 text-[14px] outline-none transition focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10"
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
                className="h-[52px] w-full border border-black/15 bg-white px-4 text-[14px] outline-none transition focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10"
                placeholder="Enter password"
              />
            </label>

            <button
              type="submit"
              className="mt-1 min-h-[50px] w-full rounded-full bg-[#111] px-5 text-[9px] font-semibold text-white transition hover:bg-[#001cac]"
            >
              Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
