import Link from "next/link";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/site-settings";
import { getWhatsappUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description:
    "KLEID.IN makes modern everyday clothing with clean proportions, useful colours and pieces designed for repeat wear.",
};


export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const whatsappHref = getWhatsappUrl(undefined, settings.whatsappNumber);

  return (
    <main className="bg-white text-[#111]">
      <section className="mx-auto w-[min(calc(100%_-_28px),1180px)] border-b border-black/10 py-12 md:py-16">
        <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
          {settings.aboutHeroEyebrow}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[.85fr_1.15fr] md:items-start">
          <h1 className="m-0 max-w-[520px] text-[clamp(34px,4.2vw,54px)] font-semibold leading-[1] tracking-[-.045em]">
            {settings.aboutHeroTitle}
          </h1>

          <div className="max-w-[620px] md:justify-self-end">
            <p className="m-0 text-[17px] font-medium leading-[1.45] tracking-[-.015em] md:text-[20px]">
              {settings.aboutHeroLead}
            </p>
            <p className="mt-5 text-[12px] leading-6 text-black/55 md:text-[13px]">
              {settings.aboutHeroBody}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#111] text-white">
        <div className="mx-auto grid w-[min(calc(100%_-_28px),1180px)] gap-8 py-12 md:grid-cols-[220px_1fr] md:py-16">
          <div>
            <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#6f8cff]">
              {settings.aboutMissionEyebrow}
            </p>
          </div>

          <div className="max-w-[760px]">
            <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
              {settings.aboutMissionTitle}
            </p>
            <p className="mt-5 text-[12px] leading-6 text-white/58 md:text-[13px]">
              {settings.aboutMissionBody}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(calc(100%_-_28px),1180px)] py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
            {settings.aboutPhilosophyEyebrow}
          </p>

          <div className="max-w-[760px]">
            <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
              {settings.aboutPhilosophyTitle}
            </p>
            <p className="mt-5 text-[12px] leading-6 text-black/55 md:text-[13px]">
              {settings.aboutPhilosophyBody}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {settings.aboutPrinciples.map((item, index) => (
            <article
              key={item.title + index}
              className="rounded-[16px] bg-[#F4F0E9] p-5 md:p-6"
            >
              <span className="text-[8px] font-semibold tracking-[.1em] text-black/35">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-8 text-[22px] font-semibold tracking-[-.03em] md:text-[24px]">
                {item.title}
              </h2>
              <p className="mt-3 text-[11px] leading-6 text-black/55 md:text-[12px]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#001cac] text-white">
        <div className="mx-auto grid w-[min(calc(100%_-_28px),1180px)] gap-8 py-12 md:grid-cols-[220px_1fr] md:py-16">
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-white/60">
            {settings.aboutBuiltEyebrow}
          </p>

          <div className="max-w-[760px]">
            <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
              {settings.aboutBuiltTitle}
            </p>
            <p className="mt-5 text-[12px] leading-6 text-white/65 md:text-[13px]">
              {settings.aboutBuiltBody}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[min(calc(100%_-_28px),1180px)] gap-8 py-12 md:grid-cols-[220px_1fr] md:py-16">
        <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
          {settings.aboutFutureEyebrow}
        </p>

        <div className="max-w-[760px]">
          <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
            {settings.aboutFutureTitle}
          </p>
          <p className="mt-5 text-[12px] leading-6 text-black/55 md:text-[13px]">
            {settings.aboutFutureBody}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#111] px-5 text-[9px] font-semibold !text-white"
            >
              {settings.aboutShopButtonLabel}
            </Link>

            {whatsappHref !== "#" ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/20 px-5 text-[9px] font-semibold !text-[#111]"
              >
                {settings.aboutWhatsappButtonLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
