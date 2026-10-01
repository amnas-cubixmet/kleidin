import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminDashboardTestimonials } from "@/components/AdminDashboardTestimonials";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";
import { localStoreSettings } from "@/data/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

function MetricCard({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-[18px] border p-4 md:p-5 " +
        (accent
          ? "border-[#001cac]/10 bg-[#eef2ff]"
          : "border-black/[.07] bg-white")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            "text-[8px] font-semibold uppercase tracking-[.12em] " +
            (accent ? "text-[#001cac]/60" : "text-[#7d8490]")
          }
        >
          {label}
        </span>
        <span
          className={
            "h-1.5 w-1.5 rounded-full " +
            (accent ? "bg-[#001cac]" : "bg-black/15")
          }
        />
      </div>
      <strong className="mt-3 block text-[clamp(24px,3vw,34px)] font-semibold tracking-[-.05em]">
        {value}
      </strong>
      <p className="mt-1.5 text-[8px] leading-4 text-[#6f7783]">{note}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products
    .filter((product) => product.stock <= 10)
    .sort((a, b) => a.stock - b.stock);

  return (
    <AdminShell
      title="Dashboard"
      description="A clear view of sales, profit, orders, customers, stock, messages, partners and customer trust. Live commerce metrics will fill automatically once order and CRM data are connected."
    >
      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Total sales"
          value="₹0"
          note="No completed orders yet"
          accent
        />
        <MetricCard label="Profit" value="₹0" note="Profit tracking not connected" />
        <MetricCard label="Orders" value="0" note="No order records yet" />
        <MetricCard label="Customers" value="0" note="Customer CRM not connected" />
        <MetricCard label="Messages" value="0" note="Inbox not connected" />
        <MetricCard label="Partners" value="0" note="Partner records not connected" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-[20px] border border-black/[.07] bg-white p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
                Business performance
              </p>
              <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
                Sales activity
              </h2>
            </div>
            <span className="rounded-full bg-[#eef1f5] px-3 py-2 text-[8px] font-semibold text-[#5f6874]">
              Last 7 days
            </span>
          </div>

          <div className="mt-5 grid min-h-[230px] place-items-center rounded-[16px] bg-[#f7f8fb] px-5 py-8 text-center">
            <div className="max-w-[430px]">
              <div className="mx-auto flex h-10 w-10 items-end justify-center gap-1 rounded-full bg-white shadow-sm">
                <span className="mb-2 h-2 w-1 rounded-full bg-black/15" />
                <span className="mb-2 h-4 w-1 rounded-full bg-[#001cac]/35" />
                <span className="mb-2 h-6 w-1 rounded-full bg-[#001cac]" />
              </div>
              <strong className="mt-4 block text-[11px] font-semibold">
                No sales history yet
              </strong>
              <p className="mt-1.5 text-[8px] leading-4 text-[#68717d]">
                Revenue, daily sales and growth charts will appear here when the
                order flow is connected to the admin.
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-[14px] bg-[#f7f8fb] p-3">
              <span className="text-[7px] font-semibold uppercase tracking-[.1em] text-black/30">
                Avg. order
              </span>
              <strong className="mt-1.5 block text-[16px] font-semibold">₹0</strong>
            </div>
            <div className="rounded-[14px] bg-[#f7f8fb] p-3">
              <span className="text-[7px] font-semibold uppercase tracking-[.1em] text-black/30">
                Conversion
              </span>
              <strong className="mt-1.5 block text-[16px] font-semibold">—</strong>
            </div>
            <div className="rounded-[14px] bg-[#f7f8fb] p-3">
              <span className="text-[7px] font-semibold uppercase tracking-[.1em] text-black/30">
                Refunds
              </span>
              <strong className="mt-1.5 block text-[16px] font-semibold">₹0</strong>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[20px] border border-black/[.07] bg-[#001cac] p-4 text-white md:p-5">
            <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-white/55">
              Store health
            </p>
            <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
              Operations
            </h2>

            <div className="mt-5 grid gap-2">
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
                  className="flex items-center justify-between gap-4 border-b border-white/10 py-2.5 last:border-b-0"
                >
                  <span className="text-[8px] text-white/55">{label}</span>
                  <strong className="text-[9px] font-semibold">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-black/[.07] bg-white p-4 md:p-5">
            <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
              Top selling
            </p>
            <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
              Best sellers
            </h2>
            <div className="mt-4 rounded-[15px] bg-[#f7f8fb] px-4 py-5">
              <strong className="text-[10px] font-semibold">Waiting for orders</strong>
              <p className="mt-1 text-[8px] leading-4 text-[#68717d]">
                Product ranking will use real sold quantities once order data exists.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[20px] border border-black/[.07] bg-white p-4 md:p-5">
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
              className="rounded-full bg-[#eef1f5] px-3 py-2 text-[8px] font-semibold text-[#545d69]"
            >
              View inventory
            </Link>
          </div>

          {lowStock.length ? (
            <div className="mt-4 grid gap-2">
              {lowStock.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-[14px] border border-black/[.06] px-3 py-3"
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
            <div className="mt-4 rounded-[15px] bg-[#f7f7f4] px-4 py-5 text-[8px] text-[#68717d]">
              Stock levels look healthy.
            </div>
          )}
        </div>

        <AdminDashboardTestimonials />
      </section>

      <section className="mt-4 rounded-[20px] border border-black/[.07] bg-white p-4 md:p-5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
            Shortcuts
          </p>
          <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
            Quick actions
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ["/admin/products", "Manage products", "Catalog and pricing"],
            ["/admin/inventory", "Check inventory", "Stock and alerts"],
            ["/admin/testimonials", "Review feedback", "Approve testimonials"],
            ["/admin/hero", "Edit storefront", "Hero content"],
          ].map(([href, label, note]) => (
            <Link
              key={href}
              href={href}
              className="rounded-[15px] border border-black/[.07] p-3.5 transition hover:border-[#001cac]/25 hover:bg-[#eef2ff]/40"
            >
              <strong className="block text-[9px] font-semibold">{label}</strong>
              <span className="mt-1 block text-[7px] leading-4 text-[#6f7783]">{note}</span>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
