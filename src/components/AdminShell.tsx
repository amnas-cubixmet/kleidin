import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNavigation } from "@/components/AdminNavigation";
import { AdminGlobalSearch } from "@/components/AdminGlobalSearch";
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
      <main className="min-h-screen bg-[#f3f5f8] px-2.5 py-2.5 pb-28 text-[#171a1f] sm:px-4 sm:py-3 md:px-5 lg:pb-5" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
        <div className="mx-auto flex w-full max-w-[1580px] items-start gap-3 xl:gap-4">
          <AdminNavigation />

          <div className="min-w-0 flex-1">
            <header className="mb-3 overflow-visible rounded-[18px] border border-[#dfe3ea] bg-white shadow-[0_10px_30px_rgba(18,26,43,.04)] sm:mb-4 sm:rounded-[20px] xl:rounded-[22px]">
              <div className="h-1 w-full rounded-t-[18px] bg-[#001cac] sm:rounded-t-[20px] xl:rounded-t-[22px]" />
              <div className="px-3.5 py-3.5 sm:px-5 sm:py-4 md:px-6 md:py-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
                  <div className="min-w-0">
                    <p className="m-0 text-[10px] font-bold uppercase tracking-[.14em] text-[#001cac]">
                      {eyebrow}
                    </p>
                    <h1 className="mt-1.5 text-[clamp(30px,7vw,46px)] font-semibold leading-[.96] tracking-[-.05em] text-[#15171a]">
                      {title}
                    </h1>
                    {description ? (
                      <p className="mt-2 max-w-[760px] text-[11px] leading-[1.6] text-[#626a76] sm:text-[12px] md:text-[12px] md:leading-5">
                        {description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                    <AdminGlobalSearch />

                    <div className="flex items-center justify-end gap-2">
                      {action}
                      <Link
                        href="/"
                        target="_blank"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d8dce4] bg-[#f8f9fb] px-4 text-[10px] font-bold text-[#343943] transition hover:border-[#bfc5cf] hover:bg-white lg:hidden"
                      >
                        Store
                      </Link>
                      <form action={logoutAdmin} className="shrink-0">
                        <button
                          type="submit"
                          className="min-h-[36px] rounded-full border border-[#111827] bg-[#111827] px-3.5 text-[9px] font-bold !text-white transition hover:bg-[#202938]"
                          style={{ color: "#ffffff" }}
                        >
                          Logout
                        </button>
                      </form>
                    </div>
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
