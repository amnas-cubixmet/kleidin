"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type AdminOrder,
  type AdminOrderStatus,
  readAdminOrders,
  writeAdminOrders,
  getOrderSubtotal,
  getOrderTotal,
  getOrderCost,
  getOrderProfit,
  ADMIN_ORDERS_UPDATED_EVENT,
} from "@/lib/admin-orders";

const statusOptions: AdminOrderStatus[] = [
  "New",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const found = readAdminOrders().find((item) => item.id === orderId) ?? null;
      setOrder(found);
      setReady(true);
    };

    sync();
    window.addEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [orderId]);

  function updateStatus(status: AdminOrderStatus) {
    if (!order) return;
    const orders = readAdminOrders();
    const updated: AdminOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };
    writeAdminOrders(
      orders.map((item) => (item.id === order.id ? updated : item)),
    );
    setOrder(updated);
  }

  function removeOrder() {
    if (!order || !window.confirm("Delete this order permanently?")) return;
    writeAdminOrders(readAdminOrders().filter((item) => item.id !== order.id));
    router.push("/admin/orders");
  }

  if (!ready) {
    return (
      <div className="grid min-h-[280px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white text-[11px] font-semibold text-[#66707b]">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white px-5 text-center">
        <div>
          <strong className="text-[15px] font-semibold">Order not found</strong>
          <p className="mt-2 text-[11px] leading-5 text-[#66707b]">
            This order may have been deleted or is not available on this device.
          </p>
          <Link
            href="/admin/orders"
            className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[#111111] px-5 text-[10px] font-bold text-white"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getOrderSubtotal(order);
  const total = getOrderTotal(order);
  const cost = getOrderCost(order);
  const profit = getOrderProfit(order);

  return (
    <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
      <div className="grid gap-3 sm:gap-4">
        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
                Order
              </p>
              <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em] sm:text-[30px]">
                {order.orderNumber}
              </h2>
              <p className="mt-1.5 text-[10px] text-[#747c86]">
                Created {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <span className="inline-flex min-h-[34px] items-center rounded-full bg-[#111111] px-3.5 text-[9px] font-bold text-white">
              {order.paymentStatus}
            </span>
          </div>

          <div className="mt-5 grid gap-4 rounded-[16px] bg-[#f5f5f5] p-4 sm:grid-cols-2 sm:rounded-[18px] sm:p-5">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#747c86]">
                Customer
              </span>
              <strong className="mt-1.5 block text-[13px] font-semibold">
                {order.customerName}
              </strong>
              <p className="mt-1.5 text-[11px] text-[#4f5863]">{order.phone}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#747c86]">
                Delivery address
              </span>
              <p className="mt-1.5 text-[11px] leading-5 text-[#4e5662]">
                {order.addressLine1}
                {order.addressLine2 ? ", " + order.addressLine2 : ""}
                {order.landmark ? ", " + order.landmark : ""}
                <br />
                {order.city}, {order.state} — {order.pincode}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#6f7782]">
              Order items
            </p>
            <h3 className="mt-1.5 text-[22px] font-semibold tracking-[-.04em] sm:text-[24px]">
              Products
            </h3>
          </div>

          <div className="mt-4 grid gap-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid min-h-[72px] gap-3 rounded-[16px] border border-[#d9dde3] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <strong className="block truncate text-[12px] font-semibold">
                    {item.name}
                  </strong>
                  <p className="mt-1.5 text-[10px] text-[#707884]">
                    {item.sku}
                    {item.size ? " · " + item.size : ""}
                    {item.color ? " · " + item.color : ""}
                    {" · Qty " + item.quantity}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <strong className="block text-[12px] font-semibold">
                    {money(item.unitPrice * item.quantity)}
                  </strong>
                  <span className="mt-1 block text-[9px] text-[#8a919c]">
                    {money(item.unitPrice)} each
                  </span>
                </div>
              </div>
            ))}
          </div>

          {order.notes ? (
            <div className="mt-4 rounded-[16px] bg-[#f5f5f5] p-4 sm:p-5">
              <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#747c86]">
                Notes
              </span>
              <p className="mt-1.5 text-[11px] leading-5 text-[#555e69]">
                {order.notes}
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <aside className="grid content-start gap-3 sm:gap-4">
        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#6f7782]">
            Status
          </p>
          <select
            value={order.status}
            onChange={(event) => updateStatus(event.target.value as AdminOrderStatus)}
            className="mt-3 h-[46px] w-full rounded-[11px] border border-[#d5d9df] bg-white px-3.5 text-[11px] font-bold text-[#343b45] outline-none focus:border-[#111111] focus:ring-2 focus:ring-black/10"
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </section>

        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#6f7782]">
            Order summary
          </p>
          <div className="mt-4 grid gap-3">
            {[
              ["Subtotal", money(subtotal)],
              ["Delivery charge", money(order.deliveryCharge)],
              ["Discount", "− " + money(order.discount)],
              ["Order total", money(total)],
              ["Product + shipping cost", money(cost)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-[#606975]">{label}</span>
                <strong className="text-[11px] font-semibold">{value}</strong>
              </div>
            ))}
            <div className="mt-1 border-t border-[#e5e8ed] pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-[#454d57]">Profit</span>
                <strong
                  className={
                    "text-[17px] font-semibold " +
                    (profit < 0 ? "text-[#b42318]" : "text-[#111111]")
                  }
                >
                  {money(profit)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
          <div className="grid gap-2">
            <Link
              href={"/admin/orders/" + order.id + "/edit"}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#111111] px-5 text-[10px] font-bold text-white transition hover:bg-black"
            >
              Edit order
            </Link>
            <button
              type="button"
              onClick={removeOrder}
              className="min-h-[44px] rounded-full border border-[#efcaca] bg-white px-5 text-[10px] font-bold text-[#a33d3d]"
            >
              Delete order
            </button>
            <Link
              href="/admin/orders"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d5d9df] bg-[#f5f5f5] px-5 text-[10px] font-bold text-[#4e5660]"
            >
              Back to orders
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
