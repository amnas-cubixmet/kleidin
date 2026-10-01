import Link from "next/link";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/site-settings";
import { getWhatsappUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description:
    "KLEID.IN creates modern everyday clothing built around clean silhouettes, useful colours and repeat wear.",
};

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const whatsappHref = getWhatsappUrl(undefined, settings.whatsappNumber);

  return (
    <main className="about-clean-page">
      <section className="about-clean-hero">
        <p>KLEID.IN / ABOUT</p>
        <h1>
          One wardrobe.
          <br />
          Less noise.
        </h1>
        <span>
          Everyday clothing designed around clean proportions, useful colours
          and pieces you can wear again and again.
        </span>
      </section>

      <section className="about-clean-split">
        <div>
          <p>MISSION</p>
          <h2>Make everyday dressing simpler.</h2>
          <span>
            Build dependable clothing that feels easy to choose, easy to combine
            and useful across everyday routines.
          </span>
        </div>

        <div>
          <p>VISION</p>
          <h2>A tighter wardrobe that works harder.</h2>
          <span>
            Fewer unnecessary pieces. Better repeat wear. A wardrobe built around
            clarity, comfort and practical style.
          </span>
        </div>
      </section>

      <section className="about-order-flow">
        <div className="about-order-copy">
          <p>HOW ORDERING WORKS</p>
          <h2>Simple from product to doorstep.</h2>
          <span>
            Choose a product and size, send the order through WhatsApp, confirm
            availability and delivery details, complete online payment when
            requested, and we prepare the order for delivery.
          </span>
        </div>

        <div className="about-order-steps">
          <div>
            <strong>Choose</strong>
            <span>Select the product, colour and size.</span>
          </div>
          <div>
            <strong>WhatsApp</strong>
            <span>Send the product directly to KLEID.IN.</span>
          </div>
          <div>
            <strong>Confirm</strong>
            <span>We confirm stock, payment and delivery details.</span>
          </div>
          <div>
            <strong>Delivery</strong>
            <span>Your confirmed order is prepared and sent to you.</span>
          </div>
        </div>
      </section>

      <section className="about-clean-final">
        <h2>Built to stay in rotation.</h2>
        <div>
          <Link href="/products">Shop the collection</Link>
          {whatsappHref !== "#" ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              Order on WhatsApp
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
