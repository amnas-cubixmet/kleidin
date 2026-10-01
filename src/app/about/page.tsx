import Link from "next/link";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/site-settings";
import { getWhatsappUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description:
    "KLEID.IN makes modern everyday clothing with clean proportions, useful colours and pieces designed for repeat wear.",
};

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const whatsappHref = getWhatsappUrl(undefined, settings.whatsappNumber);

  return (
    <main className="bg-white text-[#111]">
      <section className="mx-auto flex min-h-[72svh] w-[min(calc(100%_-_28px),1376px)] flex-col justify-between py-8 md:min-h-[78svh] md:py-12">
        <p className="m-0 text-[8px] font-semibold tracking-[.16em] text-[#001cac]">
          KLEID.IN / ABOUT
        </p>

        <div className="max-w-[1120px] py-10 md:py-16">
          <h1 className="m-0 text-[clamp(42px,6.2vw,88px)] font-semibold leading-[.9] tracking-[-.055em]">
            Clothes for
            <br />
            real rotation.
          </h1>
        </div>

        <div className="grid gap-6 pb-2 md:grid-cols-[1fr_.72fr] md:items-end">
          <p className="m-0 max-w-[760px] text-[clamp(18px,2.15vw,31px)] font-medium leading-[1.08] tracking-[-.035em]">
            KLEID.IN is built around one simple idea: everyday clothes should be
            easier to choose, easier to combine and worth wearing again.
          </p>

          <p className="m-0 max-w-[470px] text-[11px] leading-6 text-black/55 md:justify-self-end md:text-[12px]">
            We focus on clean silhouettes, dependable fabrics and useful colours
            instead of unnecessary detail. The result is a wardrobe that feels
            calm, practical and personal.
          </p>
        </div>
      </section>

      <section className="bg-[#111] text-white">
        <div className="mx-auto grid min-h-[68svh] w-[min(calc(100%_-_28px),1376px)] gap-12 py-12 md:grid-cols-[.72fr_1.28fr] md:items-end md:py-16">
          <p className="m-0 self-start text-[8px] font-semibold tracking-[.16em] text-[#6f8cff]">
            OUR MISSION
          </p>

          <div>
            <h2 className="m-0 max-w-[950px] text-[clamp(48px,7.4vw,108px)] font-semibold leading-[.86] tracking-[-.065em]">
              Make fewer pieces.
              <br />
              Make them work harder.
            </h2>

            <p className="mt-8 max-w-[680px] text-[14px] leading-7 text-white/58 md:text-[16px]">
              Our mission is not to fill a wardrobe. It is to build a tighter
              one: pieces that can move through work, weekends and ordinary days
              without needing a different identity for every moment.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(calc(100%_-_28px),1376px)] py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[.62fr_1.38fr]">
          <div>
            <p className="m-0 text-[8px] font-semibold tracking-[.16em] text-[#001cac]">
              PRODUCT PHILOSOPHY
            </p>
          </div>

          <div>
            <h2 className="m-0 max-w-[920px] text-[clamp(44px,6.5vw,92px)] font-semibold leading-[.88] tracking-[-.06em]">
              The product comes first.
            </h2>

            <p className="mt-7 max-w-[700px] text-[13px] leading-7 text-black/55 md:text-[15px]">
              Every piece starts with how it will actually be worn. Shape,
              fabric, colour and comfort all need to make sense before anything
              decorative gets added.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Proportion",
              copy: "Relaxed where it helps. Structured where it matters. Fits are designed to sit cleanly without feeling overworked.",
            },
            {
              number: "02",
              title: "Fabric",
              copy: "Materials are chosen for comfort, repeat wear and an everyday hand-feel rather than short-lived novelty.",
            },
            {
              number: "03",
              title: "Rotation",
              copy: "Colours and silhouettes are built to work together, so one piece can move through more than one look.",
            },
          ].map((item) => (
            <article
              key={item.number}
              className="min-h-[310px] rounded-[22px] bg-[#F4F0E9] p-6 md:min-h-[360px] md:p-8"
            >
              <span className="text-[8px] font-semibold tracking-[.12em] text-black/35">
                {item.number}
              </span>
              <div className="mt-24 md:mt-32">
                <h3 className="m-0 text-[clamp(30px,3.4vw,48px)] font-semibold leading-[.92] tracking-[-.05em]">
                  {item.title}
                </h3>
                <p className="mt-5 max-w-[390px] text-[11px] leading-6 text-black/55">
                  {item.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#001cac] text-white">
        <div className="mx-auto grid min-h-[62svh] w-[min(calc(100%_-_28px),1376px)] gap-10 py-12 md:grid-cols-[1.2fr_.8fr] md:items-end md:py-16">
          <div>
            <p className="m-0 text-[8px] font-semibold tracking-[.16em] text-white/55">
              BUILT FOR EVERYDAY
            </p>
            <h2 className="mt-7 max-w-[900px] text-[clamp(48px,7vw,104px)] font-semibold leading-[.86] tracking-[-.065em]">
              Wear it.
              <br />
              Live in it.
              <br />
              Repeat.
            </h2>
          </div>

          <p className="m-0 max-w-[480px] text-[13px] leading-7 text-white/62 md:justify-self-end md:text-[15px]">
            A KLEID.IN piece should feel useful after the first wear, the tenth
            wear and the fiftieth. That is the standard we want the wardrobe to
            keep.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-[min(calc(100%_-_28px),1376px)] gap-10 py-16 md:grid-cols-[1fr_.8fr] md:items-end md:py-24">
        <div>
          <p className="m-0 text-[8px] font-semibold tracking-[.16em] text-[#001cac]">
            WHERE WE ARE GOING
          </p>
          <h2 className="mt-6 max-w-[900px] text-[clamp(44px,6.4vw,90px)] font-semibold leading-[.88] tracking-[-.06em]">
            One wardrobe.
            <br />
            No labels.
          </h2>
        </div>

        <div className="md:justify-self-end">
          <p className="m-0 max-w-[500px] text-[12px] leading-7 text-black/55 md:text-[14px]">
            We are building KLEID.IN as a focused everyday clothing brand:
            stronger core products, better fit choices and a simpler way to shop
            directly with us.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#111] px-5 text-[9px] font-semibold !text-white"
            >
              Shop the collection
            </Link>

            {whatsappHref !== "#" ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/20 px-5 text-[9px] font-semibold !text-[#111]"
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
