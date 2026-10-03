import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "More | KLEID.IN Admin", robots: { index: false, follow: false } };

const links = [
  ["/admin/testimonials", "Testimonials", "Review and approve feedback"],
  ["/admin/hero", "Hero", "Storefront hero content"],
];

export default async function AdminMorePage() {
  await requireAdmin();

  return (
    <AdminShell title="More" description="All secondary admin tools in one place for mobile access.">
      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {links.map(([href, label, note]) => (
          <Link key={href} href={href} className="flex min-h-[92px] items-center justify-between gap-4 rounded-[18px] border border-black/[.07] bg-white p-4 transition hover:border-[#001cac]/20 hover:bg-[#eef2ff]/35">
            <div>
              <strong className="block text-[11px] font-semibold">{label}</strong>
              <span className="mt-1 block text-[8px] leading-4 text-black/40">{note}</span>
            </div>
            <span className="text-[15px] text-[#001cac]" aria-hidden="true">→</span>
          </Link>
        ))}
      </section>
    </AdminShell>
  );
}
