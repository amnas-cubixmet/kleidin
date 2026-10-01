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
      <div className="grid min-h-[260px] place-items-center rounded-[18px] border border-[#dfe3ea] bg-white text-[9px] font-semibold text-[#737b87]">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-[18px] border border-[#dfe3ea] bg-white px-5 text-center">
        <div>
          <strong className="text-[13px] font-semibold">Order not found</strong>
          <p className="mt-1.5 text-[9px] text-[#737b87]">
            This order may have been deleted or is not available on this device.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex min-h-9 items-center rounded-full bg-[#111827] px-4 text-[9px] font-bold text-white"
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
        <section className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[.13em] text-[#001cac]">
                Order
              </p>
              <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-.04em] sm:text-[26px]">
                {order.orderNumber}
              </h2>
              <p className="mt-1 text-[8px] text-[#7b8490]">
                Created {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <span className="rounded-full bg-[#eef2ff] px-3 py-1.5 text-[8px] font-bold text-[#001cac]">
              {order.paymentStatus}
            </span>
          </div>

          <div className="mt-4 grid gap-3 rounded-[15px] bg-[#f7f8fb] p-3.5 sm:grid-cols-2">
            <div>
              <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7d8490]">
                Customer
              </span>
              <strong className="mt-1.5 block text-[11px] font-semibold">
                {order.customerName}
              </strong>
              <p className="mt-1 text-[9px] text-[#59616d]">{order.phone}</p>
            </div>
            <div>
              <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7d8490]">
                Delivery address
              </span>
              <p className="mt-1.5 text-[9px] leading-5 text-[#4e5662]">
                {order.addressLine1}
                {order.addressLine2 ? ", " + order.addressLine2 : ""}
                {order.landmark ? ", " + order.landmark : ""}
                <br />
                {order.city}, {order.state} — {order.pincode}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[.13em] text-[#7d8490]">
              Order items
            </p>
            <h3 className="mt-1.5 text-[20px] font-semibold tracking-[-.04em]">
              Products
            </h3>
          </div>

          <div className="mt-4 grid gap-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-[14px] border border-[#e2e5eb] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <strong className="block truncate text-[10px] font-semibold">
                    {item.name}
                  </strong>
                  <p className="mt-1 text-[8px] text-[#7a828e]">
                    {item.sku}
                    {item.size ? " · " + item.size : ""}
                    {item.color ? " · " + item.color : ""}
                    {" · Qty " + item.quantity}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <strong className="block text-[10px] font-semibold">
                    {money(item.unitPrice * item.quantity)}
                  </strong>
                  <span className="mt-0.5 block text-[7px] text-[#8a919c]">
                    {money(item.unitPrice)} each
                  </span>
                </div>
              </div>
            ))}
          </div>

          {order.notes ? (
            <div className="mt-4 rounded-[14px] bg-[#f7f8fb] p-3.5">
              <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7d8490]">
                Notes
              </span>
              <p className="mt-1.5 text-[9px] leading-5 text-[#555e69]">
                {order.notes}
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <aside className="grid content-start gap-3 sm:gap-4">
        <section className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-5">
          <p className="text-[8px] font-bold uppercase tracking-[.13em] text-[#7d8490]">
            Status
          </p>
          <select
            value={order.status}
            onChange={(event) => updateStatus(event.target.value as AdminOrderStatus)}
            className="mt-3 h-10 w-full rounded-[10px] border border-[#d9dee7] bg-white px-3 text-[10px] font-bold text-[#343b45] outline-none focus:border-[#001cac]"
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </section>

        <section className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-5">
          <p className="text-[8px] font-bold uppercase tracking-[.13em] text-[#7d8490]">
            Order summary
          </p>
          <div className="mt-3 grid gap-2.5">
            {[
              ["Subtotal", money(subtotal)],
              ["Delivery charge", money(order.deliveryCharge)],
              ["Discount", "− " + money(order.discount)],
              ["Order total", money(total)],
              ["Product + shipping cost", money(cost)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-[8px] text-[#68717d]">{label}</span>
                <strong className="text-[9px] font-semibold">{value}</strong>
              </div>
            ))}
            <div className="mt-1 border-t border-[#e5e8ed] pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[8px] font-bold text-[#505864]">Profit</span>
                <strong
                  className={
                    "text-[14px] font-semibold " +
                    (profit < 0 ? "text-[#b42318]" : "text-[#18794e]")
                  }
                >
                  {money(profit)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-5">
          <div className="grid gap-2">
            <Link
              href={"/admin/orders/" + order.id + "/edit"}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#001cac] px-4 text-[9px] font-bold text-white"
            >
              Edit order
            </Link>
            <button
              type="button"
              onClick={removeOrder}
              className="min-h-10 rounded-full border border-[#efcaca] bg-white px-4 text-[9px] font-bold text-[#a33d3d]"
            >
              Delete order
            </button>
            <Link
              href="/admin/orders"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d9dee7] bg-[#f8f9fb] px-4 text-[9px] font-bold text-[#555e69]"
            >
              Back to orders
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
