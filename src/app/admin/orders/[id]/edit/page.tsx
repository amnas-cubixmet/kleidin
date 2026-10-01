import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminOrdersManager } from "@/components/AdminOrdersManager";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Order | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  return (
    <AdminShell
      title="Edit order"
      description="Update customer, delivery, product, pricing and payment information."
      action={
        <Link
          href={"/admin/orders/" + id}
          className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-[#d8dce4] bg-white px-4 text-[9px] font-bold text-[#414852]"
        >
          Back to order
        </Link>
      }
    >
      <div className="mx-auto w-full max-w-[920px]">
        <AdminOrdersManager
          view="edit"
          orderId={id}
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
