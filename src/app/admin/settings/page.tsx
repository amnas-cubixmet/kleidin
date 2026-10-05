import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminStoreSettings } from "@/components/AdminStoreSettings";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store Settings | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Store Settings"
      description="Edit live contact links, social profiles, homepage copy and About page content without changing code."
    >
      <AdminStoreSettings />
    </AdminShell>
  );
}
