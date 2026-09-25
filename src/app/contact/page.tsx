import type { Metadata } from "next";
import { getWhatsappUrl } from "@/lib/format";
import { getStoreSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const configured = Boolean(settings.whatsappNumber);

  return (
    <section className="section page-section contact-page">
      <p className="eyebrow">Contact</p>
      <h1>Questions about a product or an order?</h1>
      <p>Message KLEID.IN directly for product availability, sizing and order support.</p>

      <a
        className={`button button-dark ${configured ? "" : "button-disabled"}`}
        href={configured ? getWhatsappUrl(undefined, settings.whatsappNumber) : "#"}
        aria-disabled={!configured}
        target={configured ? "_blank" : undefined}
        rel={configured ? "noreferrer" : undefined}
      >
        {configured ? "Open WhatsApp" : "WhatsApp number not configured"}
      </a>

      {settings.supportEmail ? (
        <a className="contact-email" href={`mailto:${settings.supportEmail}`}>
          {settings.supportEmail}
        </a>
      ) : null}
    </section>
  );
}
