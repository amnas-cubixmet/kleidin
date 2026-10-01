import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminModulePlaceholder } from "@/components/AdminModulePlaceholder";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdmin();

  return (
    <AdminShell title="Settings" description="Control store details, integrations, admin preferences and operational defaults.">
      <AdminModulePlaceholder
        title="Settings module ready"
        description="Control store details, integrations, admin preferences and operational defaults."
        note="Store settings are currently partly code-based. Persistent settings can be moved here when the backend is connected."
      />
    </AdminShell>
  );
}
