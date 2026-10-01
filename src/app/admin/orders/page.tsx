import type { Metadata } from "next";
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
      description="Create orders manually, enter the customer delivery address and pincode, add products, track payment and move each order through fulfilment."
    >
      <AdminOrdersManager
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
