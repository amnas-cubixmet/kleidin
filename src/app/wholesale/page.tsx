import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WholesaleProductCard } from "@/components/WholesaleProductCard";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { getWholesaleWhatsappUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dealers",
  description:
    "Dealer enquiries for KLEID.IN products, minimum quantities and available colours.",
};

export default async function WholesalePage() {
  const [settings, products] = await Promise.all([
    getStoreSettings(),
    getCatalogProducts(),
  ]);

  const activeProducts = products.filter((product) => product.status !== "draft");
  const whatsappHref = getWholesaleWhatsappUrl(settings.whatsappNumber);
  const contactHref =
    whatsappHref !== "#"
      ? whatsappHref
      : settings.supportEmail
        ? "mailto:" + settings.supportEmail
        : "/contact";

  return (
    <main className="dealer-page dealer-page-clean">
      <div className="dealer-shell">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Dealers" },
          ]}
        />

        <section className="dealer-catalog-head dealer-catalog-head-clean">
          <div>
            <span>DEALER CATALOG</span>
            <strong>Available products</strong>
          </div>
          <p>{activeProducts.length} styles</p>
        </section>

        <section className="dealer-product-grid" aria-label="Dealer products">
          {activeProducts.map((product) => (
            <WholesaleProductCard
              key={product.id}
              product={product}
              whatsappNumber={settings.whatsappNumber}
            />
          ))}
        </section>

        <section className="dealer-footer-cta dealer-footer-clean">
          <div>
            <p>DEALER ENQUIRY</p>
            <h2>Need a mixed quantity order?</h2>
          </div>
          <a
            href={contactHref}
            target={whatsappHref !== "#" ? "_blank" : undefined}
            rel={whatsappHref !== "#" ? "noreferrer" : undefined}
          >
            Enquire on WhatsApp
          </a>
        </section>
      </div>
    </main>
  );
}
