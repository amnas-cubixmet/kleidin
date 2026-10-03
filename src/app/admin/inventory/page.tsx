import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminInventoryManager } from "@/components/AdminInventoryManager";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventory | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Inventory"
      description="Track live product stock, colour-level quantities and low-stock products from the product database."
      action={
        <Link
          href="/admin/products"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d7dbe1] bg-white px-5 text-[10px] font-bold text-[#424952]"
        >
          Products
        </Link>
      }
    >
      <AdminInventoryManager />
    </AdminShell>
  );
}
