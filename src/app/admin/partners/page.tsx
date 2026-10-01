import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminModulePlaceholder } from "@/components/AdminModulePlaceholder";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partners | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdmin();

  return (
    <AdminShell title="Partners" description="Track dealer or partner relationships, performance and business contribution.">
      <AdminModulePlaceholder
        title="Partners module ready"
        description="Track dealer or partner relationships, performance and business contribution."
        note="Partner records and partner sales attribution are not connected yet."
      />
    </AdminShell>
  );
}
