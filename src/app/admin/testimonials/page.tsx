import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminTestimonialsManager } from "@/components/AdminTestimonialsManager";
import { requireAdmin } from "@/lib/admin-auth";
import { getCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimonials | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const products = await getCatalogProducts();

  return (
    <AdminShell
      tone="monochrome"
      title="Testimonials"
      description="Review customer product feedback and store reviews before they are published."
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
