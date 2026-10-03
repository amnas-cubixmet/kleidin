import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminDashboardTestimonials } from "@/components/AdminDashboardTestimonials";
import { AdminDashboardOrderMetrics } from "@/components/AdminDashboardOrderMetrics";
import { AdminDashboardOrderActivity } from "@/components/AdminDashboardOrderActivity";
import { AdminDashboardBestSellers } from "@/components/AdminDashboardBestSellers";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";
import { localStoreSettings } from "@/data/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products
    .filter((product) => product.stock <= 10)
    .sort((a, b) => a.stock - b.stock);

  return (
    <AdminShell
      title="Dashboard"
      description="Sales, profit, manual orders, customers, inventory and customer trust in one place."
    >
      <AdminDashboardOrderMetrics />

      <section className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <AdminDashboardOrderActivity />

        <div className="grid gap-4">
          <div className="rounded-[18px] border border-[#001cac] bg-[#001cac] p-3.5 text-white sm:rounded-[20px] sm:p-4 md:p-5">
            <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-white/65">
              Store health
            </p>
            <h2 className="mt-1.5 text-[20px] sm:text-[21px] font-semibold tracking-[-.04em]">
              Operations
            </h2>

            <div className="mt-4 grid gap-1.5 sm:mt-5 sm:gap-2">
              {[
                ["Products live", String(products.length)],
                ["Units in stock", String(totalStock)],
                ["Low stock items", String(lowStock.length)],
                [
                  "WhatsApp",
                  localStoreSettings.whatsappNumber ? "Connected" : "Not set",
                ],
                ["Team activity", "Not connected"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-white/10 py-2 last:border-b-0"
                >
                  <span className="text-[8px] text-white/65">{label}</span>
                  <strong className="text-[9px] font-semibold text-white">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <AdminDashboardBestSellers />
        </div>
      </section>

      <section className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-2">
        <div className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
                Inventory alert
              </p>
              <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
                Low stock
              </h2>
            </div>
            <Link
              href="/admin/inventory"
              className="rounded-full bg-[#eef1f5] px-3 py-1.5 text-[8px] font-bold text-[#545d69]"
            >
              View inventory
            </Link>
          </div>

          {lowStock.length ? (
            <div className="mt-4 grid gap-2">
              {lowStock.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-[13px] border border-[#e2e5eb] px-3 py-2.5 sm:rounded-[14px] sm:py-3"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-[9px] font-semibold">
                      {product.name}
                    </strong>
                    <span className="mt-1 block text-[7px] text-[#7d8490]">
                      {product.sku}
                    </span>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-1.5 text-[8px] font-semibold " +
                      (product.stock <= 5
                        ? "bg-[#fff0f0] text-[#b42318]"
                        : "bg-[#fff7e8] text-[#9a6700]")
                    }
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[15px] bg-[#f7f8fb] px-4 py-5 text-[8px] text-[#68717d]">
              Stock levels look healthy.
            </div>
          )}
        </div>

        <AdminDashboardTestimonials />
      </section>

      <section className="mt-3 rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:mt-4 sm:rounded-[20px] sm:p-4 md:p-5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
            Shortcuts
          </p>
          <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
            Quick actions
          </h2>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:mt-4 md:grid-cols-4">
          {[
            ["/admin/orders", "Add order", "Manual customer order"],
            ["/admin/products", "Manage products", "Catalog and pricing"],
            ["/admin/inventory", "Check inventory", "Stock and alerts"],
            ["/admin/testimonials", "Review feedback", "Approve testimonials"],
          ].map(([href, label, note]) => (
            <Link
              key={href}
              href={href}
              className="rounded-[13px] border border-[#e2e5eb] p-3 sm:rounded-[15px] sm:p-3.5 transition hover:border-[#001cac]/25 hover:bg-[#eef2ff]/40"
            >
              <strong className="block text-[9px] font-bold">{label}</strong>
              <span className="mt-1 block text-[8px] leading-[1.45] text-[#6f7783]">{note}</span>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
