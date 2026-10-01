"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type AdminOrder,
  readAdminOrders,
  ADMIN_ORDERS_UPDATED_EVENT,
} from "@/lib/admin-orders";

export function AdminDashboardBestSellers() {
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

  const ranked = useMemo(() => {
    const totals = new Map<string, { name: string; qty: number }>();

    orders
      .filter((order) => order.status !== "Cancelled")
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = totals.get(item.productId);
          totals.set(item.productId, {
            name: item.name,
            qty: (current?.qty ?? 0) + item.quantity,
          });
        });
      });

    return [...totals.values()].sort((a, b) => b.qty - a.qty).slice(0, 4);
  }, [orders]);

  return (
    <div className="rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-4 md:p-5">
      <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#7d8490]">
        Top selling
      </p>
      <h2 className="mt-1.5 text-[20px] sm:text-[21px] font-semibold tracking-[-.04em]">
        Best sellers
      </h2>

      {ranked.length ? (
        <div className="mt-3.5 grid gap-2 sm:mt-4">
          {ranked.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-[12px] bg-[#f7f8fb] px-3 py-2.5 sm:rounded-[13px] sm:py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-full bg-white text-[8px] font-bold text-[#001cac]">
                  {index + 1}
                </span>
                <strong className="truncate text-[9px] font-semibold">
                  {item.name}
                </strong>
              </div>
              <span className="shrink-0 text-[8px] font-bold text-[#5f6874]">
                {item.qty} sold
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3.5 rounded-[14px] sm:mt-4 sm:rounded-[15px] bg-[#f7f8fb] px-4 py-5">
          <strong className="text-[10px] font-semibold">Waiting for orders</strong>
          <p className="mt-1 text-[8px] leading-4 text-[#68717d]">
            Product ranking will appear after you add manual orders.
          </p>
        </div>
      )}
    </div>
  );
}
