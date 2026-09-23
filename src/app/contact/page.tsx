import type { Metadata } from "next";
import { getWhatsappUrl } from "@/lib/format";
import { store } from "@/config/store";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const configured = Boolean(store.whatsappNumber);

  return (
    <section className="section page-section contact-page">
      <p className="eyebrow">Contact</p>
      <h1>Questions about a product or an order?</h1>
      <p>Message KLEID.IN directly and we will help you with the details.</p>

      <a
        className={`button button-dark ${configured ? "" : "button-disabled"}`}
        href={configured ? getWhatsappUrl() : "#"}
        aria-disabled={!configured}
        target={configured ? "_blank" : undefined}
        rel={configured ? "noreferrer" : undefined}
      >
        {configured ? "Open WhatsApp" : "Add WhatsApp number in .env"}
      </a>
    </section>
  );
}
