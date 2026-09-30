import type { Metadata } from "next";
import Link from "next/link";
import { getWhatsappUrl } from "@/lib/format";
import { getStoreSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "KLEID.IN product, sizing and order support.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappConfigured = Boolean(settings.whatsappNumber);
  const emailConfigured = Boolean(settings.supportEmail);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-0 pb-24 sm:px-3 md:px-4">
      <div className="grid min-h-[calc(100svh-110px)] overflow-hidden bg-[#f4f1e9] md:grid-cols-[.9fr_1.1fr] md:rounded-[26px]">
        <div className="flex min-h-[54svh] flex-col justify-between bg-[#001cac] px-5 py-7 text-white sm:px-7 md:min-h-full md:px-10 md:py-10 lg:px-14 lg:py-14">
          <div className="flex items-center justify-between gap-4">
            <p className="m-0 text-[8px] font-semibold tracking-[0.18em] text-white/70">
              KLEID.IN / SUPPORT
            </p>
            <span className="rounded-full border border-white/20 px-3 py-1.5 text-[8px] font-medium text-white/70">
              INDIA
            </span>
          </div>

          <div className="max-w-[640px] py-12 md:py-16">
            <p className="mb-3 text-[8px] font-semibold tracking-[0.16em] text-white/60">
              CUSTOMER CARE
            </p>
            <h1 className="m-0 text-[clamp(48px,14vw,72px)] font-semibold leading-[0.86] tracking-[-0.065em] md:text-[clamp(62px,7vw,100px)]">
              NEED
              <br />
              HELP?
            </h1>
            <p className="mt-6 max-w-[430px] text-[11px] leading-6 text-white/70 md:text-[12px]">
              Product availability, sizing guidance, order support and delivery
              questions — reach out and we&apos;ll point you in the right direction.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 text-[8px] font-medium tracking-[0.1em] text-white/50">
            <span>PRODUCT / SIZE / ORDER</span>
            <span>↘</span>
          </div>
        </div>

        <div className="bg-white px-5 py-8 sm:px-7 md:px-10 md:py-10 lg:px-14 lg:py-14">
          <div className="mx-auto flex h-full max-w-[680px] flex-col justify-center">
            <p className="mb-4 text-[8px] font-semibold tracking-[0.16em] text-[#001cac]">
              CONTACT KLEID.IN
            </p>

            <h2 className="m-0 max-w-[650px] text-[clamp(38px,9vw,58px)] font-semibold leading-[0.92] tracking-[-0.055em] text-[#111]">
              Questions about a product, size or order?
            </h2>

            <p className="mt-5 max-w-[560px] text-[11px] leading-6 text-[#6f6f6f] md:text-[12px]">
              Send us a message with the product name, size and your question.
              For order support, include your order reference if you have one.
            </p>

            <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {whatsappConfigured ? (
                <a
                  href={getWhatsappUrl(undefined, settings.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-between rounded-full bg-[#111] px-5 text-[10px] font-semibold text-white transition hover:bg-[#001cac]"
                >
                  <span>Open WhatsApp</span>
                  <span>↗</span>
                </a>
              ) : null}

              {emailConfigured ? (
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="inline-flex min-h-12 items-center justify-between rounded-full border border-black/10 bg-white px-5 text-[10px] font-semibold text-[#111] transition hover:border-[#001cac] hover:text-[#001cac]"
                >
                  <span>Email support</span>
                  <span>↗</span>
                </a>
              ) : null}

              {!whatsappConfigured && !emailConfigured ? (
                <Link
                  href="/products"
                  className="inline-flex min-h-12 items-center justify-between rounded-full bg-[#111] px-5 text-[10px] font-semibold text-white"
                >
                  <span>Browse products</span>

                </Link>
              ) : null}
            </div>

            {emailConfigured ? (
              <p className="mt-4 text-[9px] text-[#8a8a8a]">
                {settings.supportEmail}
              </p>
            ) : null}

            <div className="mt-10 grid border-t border-black/10 sm:grid-cols-3">
              <div className="border-b border-black/10 py-5 sm:border-b-0 sm:border-r sm:pr-5">
                <span className="block text-[7px] font-semibold tracking-[0.12em] text-[#8b8b8b]">
                  ORDER SUPPORT
                </span>
                <strong className="mt-2 block text-[11px] font-semibold leading-5 text-[#111]">
                  Product, sizing and availability
                </strong>
              </div>

              <div className="border-b border-black/10 py-5 sm:border-b-0 sm:border-r sm:px-5">
                <span className="block text-[7px] font-semibold tracking-[0.12em] text-[#8b8b8b]">
                  SHIPPING
                </span>
                <strong className="mt-2 block text-[11px] font-semibold leading-5 text-[#111]">
                  India-wide delivery
                </strong>
              </div>

              <div className="py-5 sm:pl-5">
                <span className="block text-[7px] font-semibold tracking-[0.12em] text-[#8b8b8b]">
                  RETURNS
                </span>
                <strong className="mt-2 block text-[11px] font-semibold leading-5 text-[#111]">
                  7-day return request window
                </strong>
              </div>
            </div>

            <div className="mt-8 rounded-[18px] bg-[#f6f4ef] p-5 md:p-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <span className="text-[7px] font-semibold tracking-[0.12em] text-[#001cac]">
                    BEFORE YOU MESSAGE
                  </span>
                  <p className="mt-2 max-w-[470px] text-[10px] leading-5 text-[#666]">
                    Mention the product name and size you&apos;re checking. It helps us
                    answer availability and fit questions faster.
                  </p>
                </div>
                <span className="text-[18px] text-[#001cac]">↗</span>
              </div>
            </div>

            <Link
              href="/products"
              className="mt-8 inline-flex w-fit items-center gap-8 border-b border-black pb-1 text-[9px] font-semibold tracking-[0.08em] text-[#111]"
            >
              BACK TO SHOP
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
