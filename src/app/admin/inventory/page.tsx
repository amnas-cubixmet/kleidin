import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inventory | KLEID.IN Admin", robots: { index: false, follow: false } };

export default async function AdminInventoryPage() {
  await requireAdmin();

  const ordered = [...products].sort((a, b) => a.stock - b.stock);
  const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 10).length;

  return (
    <AdminShell
      title="Inventory"
      description="Track current catalog stock and quickly identify products that need replenishment."
    >
      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        {[
          ["Total units", totalUnits],
          ["Low stock", lowStock],
          ["Products", products.length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[18px] border border-black/[.07] bg-white p-4 md:p-5">
            <span className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/35">{label}</span>
            <strong className="mt-2 block text-[28px] font-semibold tracking-[-.05em]">{value}</strong>
          </div>
        ))}
      </section>

      <section className="mt-4 overflow-hidden rounded-[20px] border border-black/[.07] bg-white">
        <div className="border-b border-black/[.06] px-4 py-4 md:px-5">
          <p className="text-[8px] font-semibold uppercase tracking-[.13em] text-black/35">Stock list</p>
          <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-.04em]">Current inventory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/[.06] bg-[#fafaf8]">
                {["Product", "SKU", "Category", "Stock", "Status"].map((head) => (
                  <th key={head} className="px-4 py-3 text-[7px] font-semibold uppercase tracking-[.1em] text-black/35">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordered.map((product) => (
                <tr key={product.id} className="border-b border-black/[.05] last:border-b-0">
                  <td className="px-4 py-3 text-[9px] font-semibold">{product.name}</td>
                  <td className="px-4 py-3 text-[8px] text-black/45">{product.sku}</td>
                  <td className="px-4 py-3 text-[8px] text-black/45">{product.category}</td>
                  <td className="px-4 py-3 text-[9px] font-semibold">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span className={
                      "inline-flex rounded-full px-2.5 py-1.5 text-[7px] font-semibold " +
                      (product.stock <= 5
                        ? "bg-[#fff0f0] text-[#b42318]"
                        : product.stock <= 10
                          ? "bg-[#fff7e8] text-[#9a6700]"
                          : "bg-[#eff8f1] text-[#18794e]")
                    }>
                      {product.stock <= 5 ? "Critical" : product.stock <= 10 ? "Low" : "Healthy"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
