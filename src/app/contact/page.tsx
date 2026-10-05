import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCatalogProducts } from "@/lib/catalog";
import { getWhatsappUrl } from "@/lib/format";
import { localStoreSettings as settings } from "@/data/store";

export const metadata: Metadata = {
  title: "Contact",
  description: "KLEID.IN product, sizing, order and dealer support.",
};

export default function ContactPage() {
  const products = getCatalogProducts();

  const whatsappHref = getWhatsappUrl(undefined, settings.whatsappNumber);
  const productImages = products
    .filter((product) => product.image)
    .slice(0, 3);

  const heroImage = productImages[0];
  const supportImageOne = productImages[1] ?? productImages[0];
  const supportImageTwo = productImages[2] ?? productImages[0];

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
          value: "KLEID.IN on Facebook",
          href: settings.facebookUrl,
          external: true,
        }
      : null,
    {
      label: "Dealers",
      value: "Wholesale and reseller enquiries",
      href: "/wholesale",
      external: false,
    },
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href: string;
    external: boolean;
  }>;

  return (
    <main className="contact-editorial-page">
      <div className="contact-editorial-shell">
        <section className="contact-editorial-hero">
          <div className="contact-editorial-copy">
            <p>KLEID.IN / SUPPORT</p>
            <h1>
              Need help?
              <br />
              We’re here.
            </h1>
            <span>
              Product availability, sizing, colours, orders, delivery or dealer
              enquiries — message us and we’ll help you choose the right next
              step.
            </span>

            <div className="contact-editorial-actions">
              {whatsappHref !== "#" ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-primary-action"
                >
                  Order / Ask on WhatsApp
                </a>
              ) : null}

              {settings.supportEmail ? (
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="contact-secondary-action"
                >
                  Email support
                </a>
              ) : null}
            </div>
          </div>

          <div className="contact-editorial-hero-media">
            {heroImage?.image ? (
              <Image
                src={heroImage.image}
                alt={heroImage.name}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 50vw"
                className="contact-editorial-image"
              />
            ) : (
              <div className="contact-editorial-image-empty">KLEID.IN</div>
            )}

            <div className="contact-editorial-media-label">
              <span>01</span>
              <strong>Product support</strong>
            </div>
          </div>
        </section>

        <section className="contact-editorial-channels" aria-label="Contact options">
          {contacts.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="contact-editorial-channel"
            >
              <span>0{index + 1}</span>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </section>

        <section className="contact-editorial-support">
          <div className="contact-editorial-support-copy">
            <p>BEFORE YOU MESSAGE</p>
            <h2>Send the details once. Get a clear answer faster.</h2>

            <div className="contact-support-list">
              <div>
                <span>01</span>
                <strong>Product</strong>
                <p>Send the product name or product page link.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Colour + size</strong>
                <p>Tell us the colour and size you want to check.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Existing order</strong>
                <p>Include the phone number or order reference used.</p>
              </div>
            </div>
          </div>

          <div className="contact-editorial-photo-grid">
            <div className="contact-editorial-photo contact-editorial-photo-tall">
              {supportImageOne?.image ? (
                <Image
                  src={supportImageOne.image}
                  alt={supportImageOne.name}
                  fill
                  sizes="(max-width: 760px) 50vw, 25vw"
                  className="contact-editorial-image"
                />
              ) : null}
            </div>

            <div className="contact-editorial-photo">
              {supportImageTwo?.image ? (
                <Image
                  src={supportImageTwo.image}
                  alt={supportImageTwo.name}
                  fill
                  sizes="(max-width: 760px) 50vw, 25vw"
                  className="contact-editorial-image"
                />
              ) : null}
            </div>
          </div>
        </section>

        <section className="contact-editorial-footer-cta">
          <div>
            <p>READY TO CHOOSE?</p>
            <h2>Browse the current collection.</h2>
          </div>

          <div>
            <Link href="/products">Shop products</Link>
            <Link href="/wholesale">Dealers</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
