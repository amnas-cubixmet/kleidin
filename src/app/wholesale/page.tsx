import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getStoreSettings } from "@/lib/site-settings";
import { getWholesaleWhatsappUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Wholesale and dealer enquiries for KLEID.IN products, availability and pricing.",
};

export default async function WholesalePage() {
  const settings = await getStoreSettings();
  const whatsappHref = getWholesaleWhatsappUrl(settings.whatsappNumber);
  const contactHref =
    whatsappHref !== "#"
      ? whatsappHref
      : settings.supportEmail
        ? "mailto:" + settings.supportEmail
        : "/contact";

  return (
    <main className="bg-white text-[#111]">
      <div className="mx-auto w-[min(calc(100%-24px),1376px)]">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Wholesale" },
          ]}
        />
      </div>

      <section className="mx-auto grid min-h-[560px] w-[min(calc(100%-24px),1376px)] overflow-hidden rounded-[24px] bg-[#001cac] text-white md:grid-cols-[1.08fr_.92fr]">
        <div className="flex flex-col justify-between p-6 md:p-9">
          <div>
            <p className="m-0 text-[8px] font-semibold tracking-[.16em] text-white/55">
              KLEID.IN / WHOLESALE
            </p>
            <h1 className="mt-6 max-w-[760px] text-[clamp(48px,8vw,112px)] font-semibold leading-[.82] tracking-[-.065em]">
              Built for stores.
            </h1>
          </div>

          <div className="mt-12 max-w-[620px]">
            <p className="text-[13px] leading-6 text-white/70 md:text-[15px]">
              For retailers, resellers and independent stores looking to stock
              KLEID.IN. Product availability, dealer pricing and minimum order
              requirements are shared based on the products and quantities you
              need.
            </p>

            <a
              href={contactHref}
              target={whatsappHref !== "#" ? "_blank" : undefined}
              rel={whatsappHref !== "#" ? "noreferrer" : undefined}
              className="mt-6 inline-flex min-h-12 items-center rounded-full bg-white px-6 text-[10px] font-semibold !text-[#111]"
              style={{ color: "#111111" }}
            >
              Start wholesale enquiry
            </a>
          </div>
        </div>

        <div className="grid content-end gap-px bg-white/15 p-px">
          {[
            ["01", "Dealer pricing", "Pricing is quoted for the products and order quantities requested."],
            ["02", "Product mix", "Build an enquiry across available styles, sizes and colours."],
            ["03", "Repeat ordering", "Use the same WhatsApp line for restocks and repeat wholesale orders."],
            ["04", "Direct support", "Confirm availability, lead time and delivery details directly with KLEID.IN."],
          ].map(([number, title, body]) => (
            <article key={number} className="bg-[#07155c] p-5 md:p-6">
              <span className="text-[8px] font-semibold text-white/45">{number}</span>
              <h2 className="mt-3 text-[24px] font-semibold tracking-[-.04em]">
                {title}
              </h2>
              <p className="mt-2 max-w-[420px] text-[10px] leading-5 text-white/55">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-[min(calc(100%-24px),1376px)] gap-3 py-8 md:grid-cols-3 md:py-12">
        {[
          ["1", "Choose products", "Send the products, colours and sizes you are interested in."],
          ["2", "Share quantity", "Tell us the approximate quantities and your store or resale requirement."],
          ["3", "Confirm quote", "We will reply with the applicable wholesale quote and availability."],
        ].map(([step, title, body]) => (
          <article
            key={step}
            className="min-h-[220px] rounded-[18px] bg-[#F4F0E9] p-5"
          >
            <span className="text-[8px] font-semibold text-[#001cac]">
              STEP {step}
            </span>
            <h3 className="mt-6 text-[30px] font-semibold tracking-[-.045em]">
              {title}
            </h3>
            <p className="mt-3 max-w-[360px] text-[10px] leading-5 text-black/55">
              {body}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto mb-10 flex w-[min(calc(100%-24px),1376px)] flex-col items-start justify-between gap-6 border-t border-black/10 py-8 md:flex-row md:items-center">
        <div>
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
            READY TO TALK?
          </p>
          <h2 className="mt-2 text-[clamp(34px,5vw,70px)] font-semibold leading-[.9] tracking-[-.055em]">
            Tell us what you need.
          </h2>
        </div>
        <a
          href={contactHref}
          target={whatsappHref !== "#" ? "_blank" : undefined}
          rel={whatsappHref !== "#" ? "noreferrer" : undefined}
          className="inline-flex min-h-12 items-center rounded-full bg-[#111] px-6 text-[10px] font-semibold !text-white"
        >
          WhatsApp wholesale
        </a>
      </section>
    </main>
  );
}
