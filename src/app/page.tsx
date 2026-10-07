import { TopFashionHero } from "@/components/TopFashionHero";
import { customOfferSlides } from "@/data/custom-offer-slides";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { FeaturedProductMotion } from "@/components/FeaturedProductMotion";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeAllProductsSection } from "@/components/HomeAllProductsSection";
import { HomeDealerSection } from "@/components/HomeDealerSection";
import { HomeSpotlightSection } from "@/components/HomeSpotlightSection";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";

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
  return (
    <div className="reference-home">
      <AutoOutfitHero products={showcaseProducts} />

      <TopFashionHero products={[]} heroSlides={customOfferSlides} fullscreen />

      <FeaturedProductMotion />

      <HomeAboutSection />


      <HomeAllProductsSection whatsappNumber={settings.whatsappNumber} />

      <HomeDealerSection />

      <HomeSpotlightSection
        product={mostLoved}
        badge={settings.homeSpotlightBadge}
      />
    </div>
  );
}
