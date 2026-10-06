import Link from "next/link";
import { getDashboardMetrics } from "@/lib/dashboard";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const quickActions = [
  {
    href: "/admin/products?new=1",
    label: "Add product",
    short: "+",
    description: "Create",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    short: "O",
    description: "Manage",
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    short: "I",
    description: "Stock",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    short: "C",
    description: "People",
  },
  {
    href: "/admin/homepage",
    label: "Homepage",
    short: "H",
    description: "Content",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    short: "S",
    description: "Config",
  },
];

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  const cards = [
    ["Revenue", formatPrice(metrics.revenue)],
    ["Orders", metrics.totalOrders],
    ["Today", metrics.todayOrders],
    ["Pending", metrics.pendingOrders],
    ["Delivered", metrics.deliveredOrders],
    ["Customers", metrics.totalCustomers],
    ["Products", metrics.totalProducts],
    ["Active", metrics.activeProducts],
    ["Draft", metrics.draftProducts],
    ["Featured", metrics.featuredProducts],
    ["Stock units", metrics.totalStockUnits],
    ["Low stock", metrics.lowStockProducts],
    ["Sold out", metrics.soldOutProducts],
    ["Cancelled", metrics.cancelledOrders],
  ];

  return (
    <div>
      <div>
        <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">
          CONTROL CENTER
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] md:text-4xl">
          Dashboard
        </h1>
      </div>

      <section
        aria-label="Quick actions"
        className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-[#101114] shadow-[0_12px_35px_rgba(0,0,0,.08)]"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-2 font-mono text-[9px] uppercase tracking-[.14em] text-white/35">
            quick-actions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3 xl:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-[72px] items-center gap-3 bg-[#101114] px-4 py-3 text-white transition hover:bg-[#181a1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3156ff]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[.05] font-mono text-sm font-bold text-[#6f86ff] transition group-hover:border-[#6f86ff]/40 group-hover:bg-[#3156ff]/10">
                {action.short}
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-[11px] font-semibold">
                  {action.label}
                </strong>
                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[.08em] text-white/35">
                  {action.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <article
            key={String(label)}
            className="rounded-2xl bg-white p-4 ring-1 ring-black/5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[.08em] text-black/40">
              {label}
            </p>
            <strong className="mt-3 block text-2xl tracking-[-.04em]">
              {value}
            </strong>
          </article>
        ))}
      </section>

      <section className="mt-7 rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-[-.02em]">Recent orders</h2>
          <span className="text-xs text-black/40">
            {metrics.recentOrders.length} shown
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="text-black/40">
              <tr>
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-black/5">
                  <td className="py-3 font-semibold">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td className="capitalize">
                    {order.status.replaceAll("-", " ")}
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
