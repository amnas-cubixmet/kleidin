import { getDashboardMetrics } from "@/lib/dashboard";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

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

      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
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
          <span className="text-xs text-black/40">{metrics.recentOrders.length} shown</span>
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
                  <td className="capitalize">{order.status.replaceAll("-", " ")}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
