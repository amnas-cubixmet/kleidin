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
      tone="monochrome"
      title="Hero"
      description="Control homepage section 01: build product heroes, timed offers, collection highlights or custom campaigns using real product data and media."
    >
      <AdminHeroManager />
    </AdminShell>
  );
}
