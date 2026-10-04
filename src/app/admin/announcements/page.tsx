import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminAnnouncementsManager } from "@/components/AdminAnnouncementsManager";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Announcements | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAnnouncementsPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Announcements"
      description="Create, schedule and control storefront announcement bars."
    >
      <AdminAnnouncementsManager />
    </AdminShell>
  );
}
