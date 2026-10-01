import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminOrdersManager } from "@/components/AdminOrdersManager";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Orders"
      description="View, search and manage manual orders. Open an order for full details, editing or deletion."
      action={
        <Link
          href="/admin/orders/new"
          className="inline-flex min-h-[36px] items-center justify-center rounded-full bg-[#001cac] px-4 text-[9px] font-bold text-white transition hover:bg-[#00158a]"
        >
          + Add order
        </Link>
      }
    >
      <AdminOrdersManager
        view="list"
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          sizes: product.sizes,
          colors: product.colors,
        }))}
      />
    </AdminShell>
  );
}
