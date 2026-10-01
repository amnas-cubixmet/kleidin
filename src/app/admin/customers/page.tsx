import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminModulePlaceholder } from "@/components/AdminModulePlaceholder";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Customers | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdmin();

  return (
    <AdminShell title="Customers" description="Manage customer profiles, order history, contact details and repeat purchase activity.">
      <AdminModulePlaceholder
        title="Customers module ready"
        description="Manage customer profiles, order history, contact details and repeat purchase activity."
        note="Customer records will populate after the order/customer database is connected."
      />
    </AdminShell>
  );
}
