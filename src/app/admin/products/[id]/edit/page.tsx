import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminProductForm } from "@/components/AdminProductForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Product | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  return (
    <AdminShell
      tone="monochrome"
      title="Edit product"
      description="Update retail and wholesale pricing, variants, media, stock and visibility."
      action={
        <Link
          href={"/admin/products/" + id}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d7dbe1] bg-white px-5 text-[10px] font-bold text-[#424952]"
        >
          Back to product
        </Link>
      }
    >
      <div className="mx-auto w-full max-w-[1040px]">
        <AdminProductForm mode="edit" productId={id} />
      </div>
    </AdminShell>
  );
}
