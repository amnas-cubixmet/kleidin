import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminModulePlaceholder } from "@/components/AdminModulePlaceholder";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdmin();

  return (
    <AdminShell title="Messages" description="Bring customer enquiries and commerce conversations into one managed inbox.">
      <AdminModulePlaceholder
        title="Messages module ready"
        description="Bring customer enquiries and commerce conversations into one managed inbox."
        note="WhatsApp or another messaging inbox must be connected before live messages can appear here."
      />
    </AdminShell>
  );
}
