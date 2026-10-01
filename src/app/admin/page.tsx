import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeroManager } from "@/components/AdminHeroManager";
import { AdminTestimonialsManager } from "@/components/AdminTestimonialsManager";
import { AdminProductManager } from "@/components/AdminProductManager";
import { logoutAdmin } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";
import { localOffers, localStoreSettings } from "@/data/store";
import { defaultHeroSlides } from "@/data/hero-slides";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdmin();
  return (
    <main className="min-h-screen bg-[#f5f5f2] px-3 py-4 text-[#111] sm:px-5 md:px-7 md:py-7">
      <div className="mx-auto w-full max-w-[1460px]">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-[22px] bg-[#001cac] px-5 py-5 text-white md:px-7 md:py-6">
          <div>
            <p className="m-0 text-[9px] font-semibold tracking-[.16em] text-white/60">
              KLEID.IN ADMIN
            </p>
            <h1 className="mt-2 text-[clamp(32px,5vw,58px)] font-semibold leading-[.92] tracking-[-.055em]">
              Store control.
            </h1>
            <p className="mt-3 max-w-[620px] text-[10px] leading-5 text-white/60 md:text-[11px]">
              Mobile-ready control for products, hero slides and customer testimonials.
              Changes are saved in this browser and applied to the storefront on
              the same device.
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              href="/"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-5 text-[10px] font-semibold !text-[#111] sm:flex-none"
              style={{ color: "#111111" }}
            >
              View store
            </Link>
            <form action={logoutAdmin} className="flex-1 sm:flex-none">
              <button
                type="submit"
                className="min-h-11 w-full rounded-full border border-white/30 px-5 text-[10px] font-semibold text-white"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {[
            ["Products", products.length],
            ["Offers", localOffers.length],
            ["Hero slides", defaultHeroSlides.length],
            ["Testimonials", "Admin managed"],
            [
              "WhatsApp",
              localStoreSettings.whatsappNumber ? "Connected" : "Not set",
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-[18px] border border-black/8 bg-white px-4 py-4"
            >
              <span className="text-[8px] font-semibold uppercase tracking-[.1em] text-black/40">
                {label}
              </span>
              <strong className="mt-2 block text-[22px] font-semibold tracking-[-.04em]">
                {value}
              </strong>
            </div>
          ))}
        </section>

        <AdminProductManager
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            category: product.category,
            price: product.price,
            stock: product.stock,
          }))}
        />

        <AdminHeroManager />

        <AdminTestimonialsManager
          products={products.map((product) => ({
            slug: product.slug,
            name: product.name,
          }))}
        />

        <div className="mt-5 rounded-[18px] border border-black/8 bg-white px-4 py-4 text-[10px] leading-5 text-black/50">
          Local mode: Hero and testimonial edits are stored in browser
          localStorage. Testimonial photos are stored locally on this device.
          Product and offer source data still comes from{" "}
          <code>src/data/products.ts</code> and{" "}
          <code>src/data/store.ts</code>.
        </div>
      </div>
    </main>
  );
}
