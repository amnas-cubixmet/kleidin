import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminProductManager } from "@/components/AdminProductManager";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function AdminProductsPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Products"
      description="Manage the product catalog, pricing, stock references and product visibility from one dedicated workspace."
    >
      <AdminProductManager
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          category: product.category,
          price: product.price,
          stock: product.stock,
        }))}
      />
    </AdminShell>
  );
}
