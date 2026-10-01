import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WholesaleProductCard } from "@/components/WholesaleProductCard";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { getWholesaleWhatsappUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dealers",
  description:
    "Dealer enquiries for KLEID.IN products, minimum orders, colours and availability.",
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
    <main className="dealer-page">
      <div className="dealer-shell">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Dealers" },
          ]}
        />

        <section className="dealer-hero">
          <div>
            <p>DEALER CATALOG</p>
            <h1>Stock KLEID.IN.</h1>
          </div>

          <div className="dealer-hero-copy">
            <p>
              Browse current products for retail and resale enquiries. Minimum
              order, available colours and stock are shown on each item.
            </p>
            <a
              href={contactHref}
              target={whatsappHref !== "#" ? "_blank" : undefined}
              rel={whatsappHref !== "#" ? "noreferrer" : undefined}
            >
              General dealer enquiry
            </a>
          </div>
        </section>

        <section className="dealer-catalog-head">
          <div>
            <span>AVAILABLE PRODUCTS</span>
            <strong>{activeProducts.length} styles</strong>
          </div>
          <p>Dealer pricing is confirmed on enquiry.</p>
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

        <section className="dealer-footer-cta">
          <div>
            <p>NEED A MIXED ORDER?</p>
            <h2>Tell us the styles and quantities.</h2>
          </div>
          <a
            href={contactHref}
            target={whatsappHref !== "#" ? "_blank" : undefined}
            rel={whatsappHref !== "#" ? "noreferrer" : undefined}
          >
            WhatsApp dealers
          </a>
        </section>
      </div>
    </main>
  );
}
