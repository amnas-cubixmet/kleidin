import type { Metadata } from "next";
import Link from "next/link";
import { getWhatsappUrl } from "@/lib/format";
import { getStoreSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "KLEID.IN product, sizing, order and dealer support.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappHref = getWhatsappUrl(undefined, settings.whatsappNumber);

  const contacts = [
    whatsappHref !== "#"
      ? {
          label: "WhatsApp",
          value: "Product, size and order support",
          href: whatsappHref,
          external: true,
        }
      : null,
    settings.supportEmail
      ? {
          label: "Email",
          value: settings.supportEmail,
          href: `mailto:${settings.supportEmail}`,
          external: false,
        }
      : null,
    settings.instagramUrl
      ? {
          label: "Instagram",
          value: "Follow KLEID.IN",
          href: settings.instagramUrl,
          external: true,
        }
      : null,
    settings.facebookUrl
      ? {
          label: "Facebook",
          value: "KLEID.IN updates",
          href: settings.facebookUrl,
          external: true,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href: string;
    external: boolean;
  }>;

  return (
    <main className="contact-clean-page">
      <section className="contact-clean-hero">
        <p>CONTACT KLEID.IN</p>
        <h1>
          Need help?
          <br />
          Message us.
        </h1>
        <span>
          Product availability, sizing, orders, delivery or dealer enquiries —
          use the channel that works best for you.
        </span>
      </section>

      <section className="contact-clean-links">
        {contacts.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
      </section>

      <section className="contact-clean-info">
        <div>
          <p>ORDER SUPPORT</p>
          <h2>Send the product name, colour and size.</h2>
        </div>
        <p>
          For an existing order, include the order reference or the phone number
          used while ordering. For dealer enquiries, mention expected quantity
          and the products you are interested in.
        </p>
      </section>

      <section className="contact-clean-bottom">
        <Link href="/products">Browse products</Link>
        <Link href="/wholesale">Dealers</Link>
      </section>
    </main>
  );
}
