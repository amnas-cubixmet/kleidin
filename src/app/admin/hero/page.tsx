import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminHeroManager } from "@/components/AdminHeroManager";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hero | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function AdminHeroPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Hero"
      description="Control storefront hero slides, content order and presentation from a dedicated page."
    >
      <AdminHeroManager />
    </AdminShell>
  );
}
