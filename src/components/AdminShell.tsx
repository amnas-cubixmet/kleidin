import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNavigation } from "@/components/AdminNavigation";
import { logoutAdmin } from "@/app/admin/actions";

export function AdminShell({
  title,
  description,
  eyebrow = "KLEID.IN ADMIN",
  children,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6f6f3] px-3 py-3 pb-24 text-[#111] sm:px-4 md:px-5 lg:pb-5">
      <div className="mx-auto flex w-full max-w-[1600px] items-start gap-4">
        <AdminNavigation />

        <div className="min-w-0 flex-1">
          <header className="mb-4 rounded-[22px] border border-black/[.06] bg-white px-4 py-4 sm:px-5 md:px-6 md:py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="m-0 text-[8px] font-semibold uppercase tracking-[.15em] text-[#001cac]">
                  {eyebrow}
                </p>
                <h1 className="mt-1.5 text-[clamp(28px,4vw,44px)] font-semibold leading-[.96] tracking-[-.05em]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-[760px] text-[9px] leading-4 text-black/42 md:text-[10px] md:leading-5">
                    {description}
                  </p>
                ) : null}
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                {action}
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-[9px] font-semibold text-black/60 transition hover:border-black/20 hover:text-black sm:flex-none lg:hidden"
                >
                  Store
                </Link>
                <form action={logoutAdmin} className="flex-1 sm:flex-none">
                  <button
                    type="submit"
                    className="min-h-10 w-full rounded-full bg-[#111] px-4 text-[9px] font-semibold text-white transition hover:bg-black/80"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
