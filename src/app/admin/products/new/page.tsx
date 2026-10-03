import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminProductForm } from "@/components/AdminProductForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Product | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewProductPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Add product"
      description="Create a complete retail product and enable wholesale pricing only when needed."
      action={
        <Link
          href="/admin/products"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d7dbe1] bg-white px-5 text-[10px] font-bold text-[#424952]"
        >
          Back to products
        </Link>
      }
    >
      <div className="mx-auto w-full max-w-[1040px]">
        <AdminProductForm mode="create" />
      </div>
    </AdminShell>
  );
}
