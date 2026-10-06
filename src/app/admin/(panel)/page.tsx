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
    href: "/admin/orders?new=1",
    label: "New order",
    short: "O",
    description: "Create",
  },
  {
    href: "/admin/inventory?adjust=1",
    label: "Update stock",
    short: "I",
    description: "Adjust",
  },
  {
    href: "/admin/orders",
    label: "Payments",
    short: "₹",
    description: "Collect",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    short: "C",
    description: "Manage",
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

function statusClass(status: string) {
  if (status === "delivered" || status === "paid") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "cancelled" || status === "failed" || status === "refunded") {
    return "bg-red-50 text-red-700";
  }
  if (status === "new" || status === "pending") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-black/[.04] text-black/55";
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const maxDailyRevenue = Math.max(
    1,
    ...metrics.salesSeries.map((item) => item.revenue),
  );

  const primaryCards = [
    {
      label: "Total sales",
      value: formatPrice(metrics.revenue),
      help: "Non-cancelled sales",
    },
    {
      label: "Today",
      value: formatPrice(metrics.todayRevenue),
      help: `${metrics.todayOrders} orders today`,
    },
    {
      label: "Paid",
      value: formatPrice(metrics.paidRevenue),
      help: "Payment received",
    },
    {
      label: "Pending payment",
      value: formatPrice(metrics.pendingPayments),
      help: "Still to collect",
      attention: metrics.pendingPayments > 0,
    },
    {
      label: "Gross profit",
      value:
        metrics.grossProfit === null
          ? "Set costs"
          : formatPrice(metrics.grossProfit),
      help:
        metrics.grossProfit === null
          ? "Add product cost prices"
          : "Sales minus product cost",
    },
    {
      label: "Product cost",
      value: formatPrice(metrics.productCost),
      help: "Estimated COGS",
    },
    {
      label: "Inventory value",
      value: formatPrice(metrics.inventoryValue),
      help: "Stock × cost price",
    },
    {
      label: "Need approval",
      value: metrics.newOrders,
      help: "New orders to confirm",
      attention: metrics.newOrders > 0,
    },
  ];

  const operationCards = [
    ["Products", metrics.totalProducts],
    ["Active products", metrics.activeProducts],
    ["Customers", metrics.totalCustomers],
    ["Orders", metrics.totalOrders],
    ["Stock units", metrics.totalStockUnits],
    ["Low stock", metrics.lowStockProducts],
    ["Sold out", metrics.soldOutProducts],
    ["Pending orders", metrics.pendingOrders],
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">
            CONTROL CENTER
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-black/45">
            Sales, products, payments, stock and fulfilment in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-black/45">
          <span className="rounded-full bg-white px-3 py-2 ring-1 ring-black/5">
            {metrics.costConfiguredProducts}/{metrics.totalProducts} products have cost
          </span>
          <span className="rounded-full bg-white px-3 py-2 ring-1 ring-black/5">
            {metrics.deliveredOrders} delivered
          </span>
        </div>
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

        <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4 xl:grid-cols-7">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-[74px] items-center gap-3 bg-[#101114] px-4 py-3 text-white transition hover:bg-[#181a1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3156ff]"
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

      <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <article
            key={card.label}
            className={
              "rounded-2xl p-4 ring-1 " +
              (card.attention
                ? "bg-amber-50 ring-amber-200"
                : "bg-white ring-black/5")
            }
          >
            <p
              className={
                "text-[9px] font-bold uppercase tracking-[.1em] " +
                (card.attention ? "text-amber-700" : "text-black/40")
              }
            >
              {card.label}
            </p>
            <strong className="mt-2 block break-words text-xl tracking-[-.04em] sm:text-2xl">
              {card.value}
            </strong>
            <span className="mt-1.5 block text-[9px] leading-4 text-black/40">
              {card.help}
            </span>
          </article>
        ))}
      </section>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
        <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
                LAST 7 DAYS
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-[-.025em]">
                Sales graph
              </h2>
            </div>
            <span className="text-[10px] text-black/40">Revenue by day</span>
          </div>

          <div className="mt-6 grid h-[220px] grid-cols-7 items-end gap-2 sm:gap-3">
            {metrics.salesSeries.map((item) => {
              const height =
                item.revenue > 0
                  ? Math.max(8, Math.round((item.revenue / maxDailyRevenue) * 100))
                  : 2;

              return (
                <div
                  key={item.key}
                  className="flex h-full min-w-0 flex-col justify-end"
                >
                  <div className="mb-2 text-center">
                    <span className="hidden text-[9px] font-semibold text-black/45 sm:block">
                      {item.revenue ? formatPrice(item.revenue) : "—"}
                    </span>
                  </div>
                  <div className="flex h-[155px] items-end rounded-xl bg-black/[.025] p-1">
                    <div
                      className="w-full rounded-lg bg-[#001cac] transition-[height]"
                      style={{ height: `${height}%` }}
                      title={`${item.label}: ${formatPrice(item.revenue)} · ${item.orders} orders`}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <strong className="block text-[10px]">{item.label}</strong>
                    <span className="text-[8px] text-black/35">
                      {item.orders} ord
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
              PRODUCT PERFORMANCE
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-.025em]">
              Best sellers
            </h2>
          </div>

          <div className="mt-4 divide-y divide-black/5">
            {metrics.topProducts.map((product, index) => (
              <div
                key={product.productId || product.name}
                className="flex items-center gap-3 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black/[.035] text-[10px] font-black text-black/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-xs">
                    {product.name}
                  </strong>
                  <span className="mt-0.5 block truncate text-[9px] text-black/40">
                    {product.sku || "No SKU"} · {product.quantity} sold
                  </span>
                </div>
                <span className="shrink-0 text-right text-[10px] font-bold">
                  {formatPrice(product.revenue)}
                </span>
              </div>
            ))}

            {!metrics.topProducts.length ? (
              <div className="py-8 text-center text-xs text-black/40">
                Sales data will appear after orders are created.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {operationCards.map(([label, value]) => (
          <article
            key={String(label)}
            className="rounded-2xl bg-white p-4 ring-1 ring-black/5"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[.08em] text-black/40">
              {label}
            </p>
            <strong className="mt-2 block text-2xl tracking-[-.04em]">
              {value}
            </strong>
          </article>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-black/5 p-4 sm:p-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
              FULFILMENT
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-.02em]">
              Recent orders
            </h2>
          </div>
          <Link
            href="/admin/orders"
            className="rounded-xl border border-black/10 px-3 py-2 text-[10px] font-bold"
          >
            Manage orders
          </Link>
        </div>

        <div className="grid gap-2 p-3 md:hidden">
          {metrics.recentOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-black/8 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-xs">
                    {order.orderNumber}
                  </strong>
                  <span className="mt-1 block truncate text-[10px] text-black/45">
                    {order.customerName}
                  </span>
                </div>
                <strong className="shrink-0 text-xs">
                  {formatPrice(order.total)}
                </strong>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-[8px] font-bold uppercase " +
                    statusClass(order.status)
                  }
                >
                  {order.status.replaceAll("-", " ")}
                </span>
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-[8px] font-bold uppercase " +
                    statusClass(order.paymentStatus)
                  }
                >
                  {order.paymentStatus}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-black/[.015] text-black/40">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="pr-5">Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-semibold">
                    {order.orderNumber}
                  </td>
                  <td>{order.customerName}</td>
                  <td className="font-semibold">{formatPrice(order.total)}</td>
                  <td>
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase " +
                        statusClass(order.paymentStatus)
                      }
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase " +
                        statusClass(order.status)
                      }
                    >
                      {order.status.replaceAll("-", " ")}
                    </span>
                  </td>
                  <td className="pr-5 text-black/45">
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
