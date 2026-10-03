import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminProductsList } from "@/components/AdminProductsList";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | KLEID.IN Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  await requireAdmin();

  return (
    <AdminShell
      tone="monochrome"
      title="Products"
      description="Manage retail pricing, optional wholesale pricing, stock, colours, media and product visibility."
      action={
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#111111] px-5 text-[10px] font-bold !text-white transition hover:bg-black"
          style={{ color: "#fff" }}
        >
          + Add product
        </Link>
      }
    >
      <AdminProductsList />
    </AdminShell>
  );
}
