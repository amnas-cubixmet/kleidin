import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AdminDataSetupManager } from "@/components/AdminDataSetupManager";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data Setup | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDataSetupPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Data Setup"
      description="Load realistic internal test records into Supabase and Cloudinary without publishing them to customers."
    >
      <AdminDataSetupManager />
    </AdminShell>
  );
}
