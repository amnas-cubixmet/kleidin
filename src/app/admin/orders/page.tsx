import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminModulePlaceholder } from "@/components/AdminModulePlaceholder";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdmin();

  return (
    <AdminShell title="Orders" description="Track every order, payment state, fulfilment status and order value.">
      <AdminModulePlaceholder
        title="Orders module ready"
        description="Track every order, payment state, fulfilment status and order value."
        note="Order storage is not connected yet. This page is ready for the checkout/order backend."
      />
    </AdminShell>
  );
}
