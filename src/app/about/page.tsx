import Link from "next/link";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/site-settings";
import { getWhatsappUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description:
    "KLEID.IN makes modern everyday clothing with clean proportions, useful colours and pieces designed for repeat wear.",
};

const principles = [
  {
    number: "01",
    title: "Proportion",
    copy: "Relaxed where it helps and structured where it matters. Fits are designed to sit cleanly without feeling overworked.",
  },
  {
    number: "02",
    title: "Fabric",
    copy: "Materials are chosen for comfort, repeat wear and a dependable everyday feel rather than short-lived novelty.",
  },
  {
    number: "03",
    title: "Rotation",
    copy: "Colours and silhouettes are built to work together, so each piece can move easily through more than one look.",
  },
];

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const whatsappHref = getWhatsappUrl(undefined, settings.whatsappNumber);

  return (
    <main className="bg-white text-[#111]">
      <section className="mx-auto w-[min(calc(100%_-_28px),1180px)] border-b border-black/10 py-12 md:py-16">
        <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
          KLEID.IN / ABOUT
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[.85fr_1.15fr] md:items-start">
          <h1 className="m-0 max-w-[520px] text-[clamp(34px,4.2vw,54px)] font-semibold leading-[1] tracking-[-.045em]">
            Clothes for real rotation.
          </h1>

          <div className="max-w-[620px] md:justify-self-end">
            <p className="m-0 text-[17px] font-medium leading-[1.45] tracking-[-.015em] md:text-[20px]">
              KLEID.IN is built around one simple idea: everyday clothes should
              be easier to choose, easier to combine and worth wearing again.
            </p>
            <p className="mt-5 text-[12px] leading-6 text-black/55 md:text-[13px]">
              We focus on clean silhouettes, dependable fabrics and useful
              colours instead of unnecessary detail. The result is a wardrobe
              that feels calm, practical and personal.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#111] text-white">
        <div className="mx-auto grid w-[min(calc(100%_-_28px),1180px)] gap-8 py-12 md:grid-cols-[220px_1fr] md:py-16">
          <div>
            <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#6f8cff]">
              OUR MISSION
            </p>
          </div>

          <div className="max-w-[760px]">
            <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
              Our mission is to build a tighter everyday wardrobe: fewer pieces
              that work harder across work, weekends and ordinary days.
            </p>
            <p className="mt-5 text-[12px] leading-6 text-white/58 md:text-[13px]">
              We do not want to fill a wardrobe with noise. We want each piece
              to feel useful, easy to repeat and simple to combine with what
              someone already owns.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(calc(100%_-_28px),1180px)] py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
            PRODUCT PHILOSOPHY
          </p>

          <div className="max-w-[760px]">
            <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
              Every piece starts with how it will actually be worn.
            </p>
            <p className="mt-5 text-[12px] leading-6 text-black/55 md:text-[13px]">
              Shape, fabric, colour and comfort all need to make sense before
              anything decorative gets added.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {principles.map((item) => (
            <article
              key={item.number}
              className="rounded-[16px] bg-[#F4F0E9] p-5 md:p-6"
            >
              <span className="text-[8px] font-semibold tracking-[.1em] text-black/35">
                {item.number}
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
            BUILT FOR EVERYDAY
          </p>

          <div className="max-w-[760px]">
            <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
              A KLEID.IN piece should feel useful after the first wear, the
              tenth wear and the fiftieth.
            </p>
            <p className="mt-5 text-[12px] leading-6 text-white/65 md:text-[13px]">
              Repeat wear is the standard. That means straightforward fits,
              useful colours and products designed to stay in rotation instead
              of being replaced by the next trend.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[min(calc(100%_-_28px),1180px)] gap-8 py-12 md:grid-cols-[220px_1fr] md:py-16">
        <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
          WHERE WE ARE GOING
        </p>

        <div className="max-w-[760px]">
          <p className="m-0 text-[18px] font-medium leading-[1.5] tracking-[-.018em] md:text-[22px]">
            We are building KLEID.IN as a focused everyday clothing brand.
          </p>
          <p className="mt-5 text-[12px] leading-6 text-black/55 md:text-[13px]">
            The direction is simple: stronger core products, better fit choices
            and a cleaner way to shop directly with us.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#111] px-5 text-[9px] font-semibold !text-white"
            >
              Shop the collection
            </Link>

            {whatsappHref !== "#" ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/20 px-5 text-[9px] font-semibold !text-[#111]"
              >
                Order on WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
