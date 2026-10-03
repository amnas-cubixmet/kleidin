import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminOrderDetail } from "@/components/AdminOrderDetail";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  return (
    <AdminShell
      tone="monochrome"
      title="Order details"
      description="Review the complete order, update fulfilment status, edit information or delete the order."
    >
      <AdminOrderDetail orderId={id} />
    </AdminShell>
  );
}
