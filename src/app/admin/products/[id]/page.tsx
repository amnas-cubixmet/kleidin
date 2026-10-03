import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminProductDetail } from "@/components/AdminProductDetail";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Details | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  return (
    <AdminShell
      tone="monochrome"
      title="Product details"
      description="Review pricing, wholesale rules, stock, colour variants, images and product status."
    >
      <AdminProductDetail productId={id} />
    </AdminShell>
  );
}
