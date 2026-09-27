import type { Metadata } from "next";
import { getWhatsappUrl } from "@/lib/format";
import { getStoreSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "KLEID.IN product, sizing and order support.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappConfigured = Boolean(settings.whatsappNumber);

  return (
    <section className="section page-section contact-page">
      <p className="eyebrow">Customer Support</p>
      <h1>Need help with a product, size or order?</h1>

      <p>
        For product availability, sizing guidance and order support, contact
        KLEID.IN directly. Typical enquiries are answered during regular
        business hours.
      </p>

      <div className="contact-actions">
        {whatsappConfigured ? (
          <a
            className="button button-dark"
            href={getWhatsappUrl(undefined, settings.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
          >
            Open WhatsApp
          </a>
        ) : null}

        {settings.supportEmail ? (
          <a className="button button-outline" href={`mailto:${settings.supportEmail}`}>
            Email support
          </a>
        ) : null}
      </div>

      <div className="contact-info-grid">
        <div>
          <span>Order support</span>
          <strong>Product, sizing and availability</strong>
        </div>
        <div>
          <span>Shipping</span>
          <strong>India-wide delivery</strong>
        </div>
        <div>
          <span>Returns</span>
          <strong>7-day return request window</strong>
        </div>
      </div>
    </section>
  );
}
