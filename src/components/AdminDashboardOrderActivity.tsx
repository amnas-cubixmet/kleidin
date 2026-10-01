"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type AdminOrder,
  readAdminOrders,
  getOrderTotal,
  ADMIN_ORDERS_UPDATED_EVENT,
} from "@/lib/admin-orders";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function AdminDashboardOrderActivity() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    const sync = () => setOrders(readAdminOrders());
    sync();
    window.addEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const active = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "Cancelled")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders],
  );

  const total = active.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const average = active.length ? total / active.length : 0;
  const delivered = active.filter((order) => order.status === "Delivered").length;

  return (
    <div className="rounded-[20px] border border-black/[.07] bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
            Business performance
          </p>
          <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">
            Order activity
          </h2>
        </div>
        <Link
          href="/admin/orders"
          className="rounded-full bg-[#eef1f5] px-3 py-2 text-[8px] font-bold text-[#545d69]"
        >
          Manage orders
        </Link>
      </div>

      {active.length ? (
        <div className="mt-4 grid gap-2">
          {active.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 rounded-[14px] border border-[#e2e5eb] px-3 py-3"
            >
              <div className="min-w-0">
                <strong className="block truncate text-[9px] font-bold">
                  {order.customerName}
                </strong>
                <span className="mt-1 block truncate text-[7px] text-[#7d8490]">
                  {order.orderNumber} · {order.status}
                </span>
              </div>
              <strong className="shrink-0 text-[10px] font-semibold">
                {money(getOrderTotal(order))}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid min-h-[180px] place-items-center rounded-[16px] bg-[#f7f8fb] px-5 py-8 text-center">
          <div>
            <strong className="text-[11px] font-semibold">No order activity yet</strong>
            <p className="mt-1.5 text-[8px] leading-4 text-[#68717d]">
              Add a manual order and it will appear here automatically.
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-[14px] bg-[#f7f8fb] p-3">
          <span className="text-[7px] font-semibold uppercase tracking-[.1em] text-[#7d8490]">
            Avg. order
          </span>
          <strong className="mt-1.5 block text-[15px] font-semibold">{money(average)}</strong>
        </div>
        <div className="rounded-[14px] bg-[#f7f8fb] p-3">
          <span className="text-[7px] font-semibold uppercase tracking-[.1em] text-[#7d8490]">
            Delivered
          </span>
          <strong className="mt-1.5 block text-[15px] font-semibold">{delivered}</strong>
        </div>
        <div className="rounded-[14px] bg-[#f7f8fb] p-3">
          <span className="text-[7px] font-semibold uppercase tracking-[.1em] text-[#7d8490]">
            Active
          </span>
          <strong className="mt-1.5 block text-[15px] font-semibold">{active.length}</strong>
        </div>
      </div>
    </div>
  );
}
