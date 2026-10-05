"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#111]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] md:grid-cols-[230px_1fr]">
        <aside className="border-b border-black/10 bg-white p-4 md:border-b-0 md:border-r md:p-5">
          <div className="flex items-center justify-between md:block">
            <div>
              <Link href="/admin" className="text-lg font-black tracking-[-.04em]">
                KLEID.IN
              </Link>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
                Super Admin · Full Access
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-full border border-black/10 px-3 py-2 text-[11px] font-semibold md:hidden"
            >
              Logout
            </button>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:mt-8 md:block md:space-y-1">
            {nav.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block shrink-0 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition ${active ? "bg-[#001cac] text-white" : "text-black/55 hover:bg-black/[.04] hover:text-black"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-8 hidden w-full rounded-xl border border-black/10 px-3 py-2.5 text-left text-[12px] font-semibold text-black/60 md:block"
          >
            Logout
          </button>
        </aside>

        <main className="min-w-0 p-4 md:p-7 lg:p-9">{children}</main>
      </div>
    </div>
  );
}
