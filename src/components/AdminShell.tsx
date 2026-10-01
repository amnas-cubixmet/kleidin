import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNavigation } from "@/components/AdminNavigation";
import { logoutAdmin } from "@/app/admin/actions";
import { AdminViewportStyle } from "@/components/AdminViewportStyle";

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
    <>
      <AdminViewportStyle />
      <main className="min-h-screen bg-[#f1f3f7] px-3 py-3 pb-24 text-[#15171a] sm:px-4 md:px-5 lg:pb-5">
      <div className="mx-auto flex w-full max-w-[1600px] items-start gap-4">
        <AdminNavigation />

        <div className="min-w-0 flex-1">
          <header className="mb-4 overflow-hidden rounded-[22px] border border-[#dfe3ea] bg-white shadow-[0_10px_30px_rgba(18,26,43,.04)]">
            <div className="h-1 w-full bg-[#001cac]" />
            <div className="px-4 py-4 sm:px-5 md:px-6 md:py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="m-0 text-[9px] font-bold uppercase tracking-[.14em] text-[#001cac]">
                    {eyebrow}
                  </p>
                  <h1 className="mt-1.5 text-[clamp(30px,4vw,46px)] font-semibold leading-[.96] tracking-[-.05em] text-[#15171a]">
                    {title}
                  </h1>
                  {description ? (
                    <p className="mt-2 max-w-[760px] text-[10px] leading-5 text-[#626a76] md:text-[11px] md:leading-5">
                      {description}
                    </p>
                  ) : null}
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto">
                  {action}
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full border border-[#d8dce4] bg-[#f8f9fb] px-3.5 text-[9px] font-bold text-[#343943] transition hover:border-[#bfc5cf] hover:bg-white sm:flex-none lg:hidden"
                  >
                    Store
                  </Link>
                  <form action={logoutAdmin} className="flex-1 sm:flex-none">
                    <button
                      type="submit"
                      className="min-h-9 w-full rounded-full border border-[#111827] bg-[#111827] px-3.5 text-[9px] font-bold !text-white transition hover:bg-[#202938]"
                      style={{ color: "#ffffff" }}
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
    </>
  );
}
