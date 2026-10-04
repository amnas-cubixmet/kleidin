import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminDashboardTestimonials } from "@/components/AdminDashboardTestimonials";
import { AdminDashboardOrderMetrics } from "@/components/AdminDashboardOrderMetrics";
import { AdminDashboardOrderActivity } from "@/components/AdminDashboardOrderActivity";
import { AdminDashboardBestSellers } from "@/components/AdminDashboardBestSellers";
import { AdminDashboardSalesChart } from "@/components/AdminDashboardSalesChart";
import { AdminDemoModeControl } from "@/components/AdminDemoModeControl";
import { requireAdmin } from "@/lib/admin-auth";
import { listProducts } from "@/lib/mongodb-products";
import { localStoreSettings } from "@/data/store";
import { getDemoModeEnabled } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [products, demoModeEnabled] = await Promise.all([
    listProducts().catch(() => []),
    getDemoModeEnabled(),
  ]);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products
    .filter((product) => product.stock <= 10)
    .sort((a, b) => a.stock - b.stock);

  return (
    <AdminShell
      title="Dashboard"
      description="Sales, profit, manual orders, customers, inventory and customer trust in one place."
    >
      <AdminDemoModeControl initialEnabled={demoModeEnabled} />
      <AdminDashboardOrderMetrics />
      <AdminDashboardSalesChart />

      <section className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <AdminDashboardOrderActivity />

        <div className="grid gap-4">
          <div className="rounded-[18px] border border-[#001cac] bg-[#001cac] p-3.5 text-white sm:rounded-[20px] sm:p-4 md:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/75">
              Store health
            </p>
            <h2 className="mt-1.5 text-[22px] sm:text-[24px] font-semibold tracking-[-.04em]">
              Operations
            </h2>

            <div className="mt-4 grid gap-1.5 sm:mt-5 sm:gap-2">
              {[
                ["Products", String(products.length)],
                ["Stock units", String(totalStock)],
                ["Low stock", String(lowStock.length)],
                [
                  "WhatsApp support",
                  localStoreSettings.whatsappNumber ? "Connected" : "Not set",
                ],
                              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex min-h-[44px] items-center justify-between gap-4 border-b border-white/10 py-2.5 last:border-b-0"
                >
                  <span className="text-[10px] font-medium text-white/75">{label}</span>
                  <strong className="text-[11px] font-bold text-white">{value}</strong>
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
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6f7783]">
                Inventory alert
              </p>
              <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-.035em] sm:text-[24px]">
                Low stock
              </h2>
            </div>
            <Link
              href="/admin/inventory"
              className="inline-flex min-h-[44px] items-center rounded-full bg-[#eef1f5] px-4 text-[10px] font-bold text-[#454d58]"
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
                    <strong className="block truncate text-[11px] font-semibold">
                      {product.name}
                    </strong>
                    <span className="mt-1 block text-[9px] text-[#747c88]">
                      {product.sku}
                    </span>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-3 py-2 text-[9px] font-bold " +
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
            <div className="mt-4 rounded-[15px] bg-[#f7f8fb] px-4 py-5 text-[10px] text-[#5f6874]">
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
            ["/admin/orders/new", "Add order", "Create a new manual order"],
            ["/admin/products", "Products", "Manage catalog and pricing"],
            ["/admin/inventory", "Inventory", "Check stock and alerts"],
            ["/admin/testimonials", "Testimonials", "Review and approve feedback"],
          ].map(([href, label, note]) => (
            <Link
              key={href}
              href={href}
              className="min-h-[84px] rounded-[13px] border border-[#e2e5eb] p-3.5 sm:rounded-[15px] sm:p-4 transition hover:border-[#001cac]/25 hover:bg-[#eef2ff]/40"
            >
              <strong className="block text-[11px] font-bold">{label}</strong>
              <span className="mt-1.5 block text-[10px] leading-[1.5] text-[#626b77]">{note}</span>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
