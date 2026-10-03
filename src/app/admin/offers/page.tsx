import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminOffersManager } from "@/components/AdminOffersManager";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offers | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOffersPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Offers"
      description="Manage product-level discounts, scheduled promotions, countdowns and expiry."
    >
      <AdminOffersManager />
    </AdminShell>
  );
}
