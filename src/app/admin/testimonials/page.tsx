import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminTestimonialsManager } from "@/components/AdminTestimonialsManager";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Testimonials | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function AdminTestimonialsPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Testimonials"
      description="Review customer submissions, approve trusted feedback and manage which stories appear on the storefront."
    >
      <AdminTestimonialsManager
        products={products.map((product) => ({
          slug: product.slug,
          name: product.name,
        }))}
      />
    </AdminShell>
  );
}
