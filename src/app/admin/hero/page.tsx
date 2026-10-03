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
      description="Build product heroes, timed offers, collection highlights and custom campaigns. Add only the slides you need."
    >
      <AdminHeroManager />
    </AdminShell>
  );
}
