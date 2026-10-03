import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminOrdersManager } from "@/components/AdminOrdersManager";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Order | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewOrderPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Add order"
      description="Create a manual order with customer, delivery, product and payment details."
      action={
        <Link
          href="/admin/orders"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d8dce4] bg-white px-5 text-[10px] font-bold text-[#414852]"
        >
          Back to orders
        </Link>
      }
    >
      <div className="mx-auto w-full max-w-[920px]">
        <AdminOrdersManager
          view="create"
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            sizes: product.sizes,
            colors: product.colors,
          }))}
        />
      </div>
    </AdminShell>
  );
}
