import type { Metadata } from "next";
import { AdminFeaturedManager } from "@/components/AdminFeaturedManager";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Featured | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminFeaturedPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Featured"
      description="Control homepage section 02: choose real products, arrange their order and publish only active products with real media."
    >
      <AdminFeaturedManager />
    </AdminShell>
  );
}
