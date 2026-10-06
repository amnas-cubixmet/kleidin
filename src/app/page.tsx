import Image from "next/image";
import Link from "next/link";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
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
