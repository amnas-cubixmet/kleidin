"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type AdminOrder,
  readAdminOrders,
  getOrderTotal,
  getOrderProfit,
  ADMIN_ORDERS_UPDATED_EVENT,
} from "@/lib/admin-orders";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function Card({
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
        "min-w-0 rounded-[16px] border p-3.5 sm:rounded-[18px] md:p-5 " +
        (accent
          ? "border-[#001cac]/10 bg-[#eef2ff]"
          : "border-[#dfe3ea] bg-white")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            "text-[8px] font-semibold uppercase tracking-[.12em] " +
            (accent ? "text-[#001cac]/70" : "text-[#7d8490]")
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
      <strong className="mt-2.5 block overflow-hidden text-ellipsis text-[clamp(20px,6vw,34px)] font-semibold tabular-nums tracking-[-.05em] sm:mt-3">
        {value}
      </strong>
      <p className="mt-1.5 text-[8px] leading-[1.45] text-[#6f7783]">{note}</p>
    </div>
  );
}

export function AdminDashboardOrderMetrics() {
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

  const data = useMemo(() => {
    const active = orders.filter((order) => order.status !== "Cancelled");
    const sales = active.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const profit = active.reduce((sum, order) => sum + getOrderProfit(order), 0);
    const customers = new Set(active.map((order) => order.phone.trim()).filter(Boolean));

    return {
      sales,
      profit,
      orders: active.length,
      customers: customers.size,
    };
  }, [orders]);

  return (
    <section className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-6">
      <Card
        label="Total sales"
        value={money(data.sales)}
        note={data.orders ? "From manual orders" : "No orders added yet"}
        accent
      />
      <Card
        label="Profit"
        value={money(data.profit)}
        note={data.orders ? "After product + shipping cost" : "Add cost while creating orders"}
      />
      <Card
        label="Orders"
        value={String(data.orders)}
        note="Cancelled orders excluded"
      />
      <Card
        label="Customers"
        value={String(data.customers)}
        note="Unique customer phone numbers"
      />
      <Card label="Messages" value="0" note="Inbox not connected" />
      <Card label="Partners" value="0" note="Partner records not connected" />
    </section>
  );
}
