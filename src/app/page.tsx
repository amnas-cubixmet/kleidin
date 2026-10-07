import Link from "next/link";
import Image from "next/image";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { FeaturedProductMotion } from "@/components/FeaturedProductMotion";
import { ProductActions } from "@/components/ProductActions";
import { formatPrice } from "@/lib/format";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { getProductPrimaryImage } from "@/lib/product-images";

export const dynamic = "force-dynamic";

function productSlugFromUrl(value: string) {
  const input = value.trim();
  if (!input) return "";

  try {
    const url = new URL(input, "https://kleid.in");
    const parts = url.pathname.split("/").filter(Boolean);
    const productsIndex = parts.lastIndexOf("products");

    if (productsIndex >= 0 && parts[productsIndex + 1]) {
      return decodeURIComponent(parts[productsIndex + 1]).toLowerCase();
    }

    return decodeURIComponent(parts.at(-1) || "").toLowerCase();
  } catch {
    return input
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.toLowerCase() || "";
  }
}

export default async function Home() {
  const [products, settings] = await Promise.all([
    getCatalogProducts(),
    getStoreSettings(),
  ]);

  const activeProducts = products
    .filter((product) => product.status === "active")
    .sort(
      (a, b) =>
        (a.sortOrder ?? a.featuredSortOrder ?? 100) -
        (b.sortOrder ?? b.featuredSortOrder ?? 100),
    );

  const requestedShowcaseSlugs = settings.homeShowcaseProductUrls
    .map(productSlugFromUrl)
    .filter(Boolean)
    .slice(0, 8);

  const activeBySlug = new Map(
    activeProducts.map((product) => [product.slug.toLowerCase(), product]),
  );

  const linkedShowcaseProducts = requestedShowcaseSlugs
    .map((slug) => activeBySlug.get(slug))
    .filter((product): product is (typeof activeProducts)[number] =>
      Boolean(product),
    );

  const linkedIds = new Set(
    linkedShowcaseProducts.map((product) => product.id),
  );

  const showcaseProducts = [
    ...linkedShowcaseProducts,
    ...activeProducts.filter((product) => !linkedIds.has(product.id)),
  ].slice(0, 20);

  const mostLoved = products.find(
    (product) => product.spotlight && product.status === "active",
  );
  const mostLovedImage = mostLoved
    ? getProductPrimaryImage(mostLoved)
    : "";

  return (
    <div className="reference-home">
      <AutoOutfitHero products={showcaseProducts} />

      <FeaturedProductMotion products={activeProducts} />

      <section className="border-y border-black/10 bg-[#fafafa] px-5 py-20 text-[#111111] sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="m-0 text-[9px] font-semibold uppercase tracking-[.16em] text-black/45">
              About KLEID.IN
            </p>

            <h2 className="mt-4 max-w-[430px] text-[clamp(38px,5vw,72px)] font-semibold leading-[.92] tracking-[-.055em]">
              Everyday pieces, made with attention to the details.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="max-w-[620px] text-[14px] leading-7 text-black/62 sm:text-[15px]">
              We focus on the things you actually feel when you wear a garment:
              fabric weight, GSM, fit, structure and finish. Clean essentials,
              designed to be worn often and styled without effort.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-black/10 pt-7 sm:grid-cols-4">
              {[
                ["Fabric", "Selected for feel"],
                ["GSM", "Balanced weight"],
                ["Fit", "Easy everyday cut"],
                ["Finish", "Clean construction"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="block text-[8px] font-semibold uppercase tracking-[.12em] text-black/35">
                    {label}
                  </span>
                  <strong className="mt-2 block text-[11px] font-semibold text-black/78">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {mostLoved ? (
        <section className="home-spotlight">
          <div className="home-spotlight-grid">
            <Link
              href={`/products/${mostLoved.slug}`}
              className="home-spotlight-media"
              aria-label={`View ${mostLoved.name}`}
            >
              {mostLovedImage ? (
                <Image
                  src={mostLovedImage}
                  alt={mostLoved.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 58vw"
                  className="home-spotlight-image"
                />
              ) : (
                <span>No image</span>
              )}

              <div className="home-spotlight-media-badge">
                <span>01</span>
                <strong>{settings.homeSpotlightBadge}</strong>
              </div>
            </Link>

            <div className="home-spotlight-info">
              <div className="home-spotlight-info-inner">
                <div className="home-spotlight-topline">
                  <span>
                    {mostLoved.stock > 0 ? "In stock" : "Sold out"}
                  </span>
                </div>

                <div>
                  <h2>{mostLoved.name}</h2>

                  <div className="home-spotlight-price">
                    <strong>{formatPrice(mostLoved.price)}</strong>
                    {mostLoved.compareAtPrice ? (
                      <del>{formatPrice(mostLoved.compareAtPrice)}</del>
                    ) : null}
                  </div>
                </div>

                <p className="home-spotlight-description">
                  {mostLoved.description}
                </p>

                <div className="home-spotlight-meta">
                  <div>
                    <span>Colour</span>
                    <strong>{mostLoved.colors.join(" / ")}</strong>
                  </div>
                  <div>
                    <span>Sizes</span>
                    <strong>{mostLoved.sizes.join(" · ")}</strong>
                  </div>
                </div>

                <ProductActions product={mostLoved} compact />

                <Link
                  href={`/products/${mostLoved.slug}`}
                  className="home-spotlight-view"
                >
                  View full product <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
