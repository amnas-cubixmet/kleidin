"use client";

import { useEffect, useMemo, useState } from "react";
import { type AdminOrder, getOrderTotal } from "@/lib/admin-orders";

function money(value: number) {
  const amount = Math.max(0, Number(value) || 0);

  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    return "₹" + (crore >= 10 ? Math.round(crore) : crore.toFixed(1).replace(/\.0$/, "")) + "Cr";
  }

  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return "₹" + (lakh >= 10 ? Math.round(lakh) : lakh.toFixed(1).replace(/\.0$/, "")) + "L";
  }

  if (amount >= 1_000) {
    const thousand = amount / 1_000;
    return "₹" + (thousand >= 10 ? Math.round(thousand) : thousand.toFixed(1).replace(/\.0$/, "")) + "K";
  }

  return "₹" + Math.round(amount);
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function AdminDashboardSalesChart() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/orders", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load orders.");
        return (data.orders ?? []) as AdminOrder[];
      })
      .then((nextOrders) => {
        if (active) setOrders(nextOrders);
      })
      .catch(() => {
        if (active) setOrders([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const data = useMemo(() => {
    const totals = new Map<string, { revenue: number; orders: number }>();

    orders
      .filter((order) => order.status !== "Cancelled")
      .forEach((order) => {
        const key = order.createdAt.slice(0, 10);
        const current = totals.get(key) ?? { revenue: 0, orders: 0 };
        current.revenue += getOrderTotal(order);
        current.orders += 1;
        totals.set(key, current);
      });

    const days = Array.from({ length: 30 }, (_, offset) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (29 - offset));
      const key = dayKey(date);
      const value = totals.get(key) ?? { revenue: 0, orders: 0 };

      return {
        key,
        label: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        revenue: value.revenue,
        orders: value.orders,
      };
    });

    const maxRevenue = Math.max(1, ...days.map((item) => item.revenue));
    const totalRevenue = days.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = days.reduce((sum, item) => sum + item.orders, 0);

    return { days, maxRevenue, totalRevenue, totalOrders };
  }, [orders]);

  if (!mounted) {
    return (
      <section className="mt-3 rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:mt-4 sm:rounded-[20px] sm:p-4 md:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6f7783]">
          Last 30 days
        </p>
        <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-.04em] sm:text-[24px]">
          Sales trend
        </h2>
        <div className="mt-5 h-[180px] animate-pulse rounded-[14px] bg-[#f3f4f6]" />
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:mt-4 sm:rounded-[20px] sm:p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6f7783]">
            Last 30 days
          </p>
          <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-.04em] sm:text-[24px]">
            Sales trend
          </h2>
        </div>

        <div className="flex gap-5 text-right">
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-[.1em] text-[#8a919c]">
              Revenue
            </span>
            <strong className="mt-1 block text-[15px] font-semibold">
              {money(data.totalRevenue)}
            </strong>
          </div>
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-[.1em] text-[#8a919c]">
              Orders
            </span>
            <strong className="mt-1 block text-[15px] font-semibold">
              {data.totalOrders}
            </strong>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="grid min-w-[680px] grid-cols-[repeat(30,minmax(12px,1fr))] items-end gap-1.5">
          {data.days.map((item, index) => {
            const height =
              item.revenue > 0
                ? Math.max(10, Math.round((item.revenue / data.maxRevenue) * 100))
                : 3;

            return (
              <div key={item.key} className="grid min-w-0 gap-2">
                <div className="flex h-[180px] items-end">
                  <div
                    className={
                      "w-full rounded-t-[5px] transition " +
                      (item.revenue > 0 ? "bg-[#001cac]" : "bg-[#e7e9ee]")
                    }
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${money(item.revenue)} · ${item.orders} orders`}
                  />
                </div>
                <span className="h-4 truncate text-center text-[7px] font-medium text-[#8a919c]">
                  {index % 5 === 0 || index === 29 ? item.label : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
