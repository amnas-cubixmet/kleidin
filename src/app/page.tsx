import { getHomepageHeroCampaigns } from "@/lib/homepage-hero";
import { getActiveAnimationBars } from "@/lib/animation-bars";
import { getMongoEnvironment } from "@/lib/server-env";
import { HomepageAnimationBars } from "@/components/HomepageAnimationBars";
import { HomepageHeroV2 } from "@/components/HomepageHeroV2";
import type { HomepageHeroCampaign } from "@/types/homepage-hero";
import { FeaturedProductMotion } from "@/components/FeaturedProductMotion";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeAllProductsSection } from "@/components/HomeAllProductsSection";
import { HomeDealerSection } from "@/components/HomeDealerSection";
import { HomeSpotlightSection } from "@/components/HomeSpotlightSection";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, settings, heroCampaigns, animationBars] = await Promise.all([
    getCatalogProducts(),
    getStoreSettings(),
    getHomepageHeroCampaigns(),
    getActiveAnimationBars(),
  ]);

  const activeProducts = products
    .filter((product) => product.status === "active")
    .sort(
      (a, b) =>
        (a.sortOrder ?? a.featuredSortOrder ?? 100) -
        (b.sortOrder ?? b.featuredSortOrder ?? 100),
    );

  const demo = !getMongoEnvironment();
  const featuredProducts = activeProducts.filter((product) => product.featuredAnimationEnabled || product.featured)
    .sort((a, b) => (a.animationSortOrder ?? a.featuredSortOrder ?? 100) - (b.animationSortOrder ?? b.featuredSortOrder ?? 100));
  const fallbackHero: HomepageHeroCampaign | null =
    settings.homeDefaultHeroEnabled
      ? {
          id: "fallback-hero",
          mode: "image",
          eyebrow: settings.homeDefaultHeroLabel,
          title: settings.homeDefaultHeroTitle,
          subtitle: settings.homeDefaultHeroSubtitle,
          buttonLabel: settings.homeDefaultHeroButtonLabel,
          buttonHref:
            settings.homeDefaultHeroButtonHref || "/#all-products",
          imageUrl: settings.homeDefaultHeroImageUrl,
          imagePosition: settings.homeDefaultHeroImagePosition,
          enabled: true,
          priority: -1000,
          startsAt: null,
          endsAt: null,
          showCountdown: false,
          offerType: "percentage",
          offerValue: 0,
          offerBadge: "",
        }
      : null;

  const homepageHeroCampaigns = fallbackHero
    ? [fallbackHero, ...heroCampaigns]
    : heroCampaigns;

  const mostLoved = products.find(
    (product) => product.spotlight && product.status === "active",
  );
  return (
    <div className="reference-home">
      {settings.homeAnimationBarsEnabled ? (
        <HomepageAnimationBars bars={animationBars} placement="before-hero" />
      ) : null}

      {settings.homeProductHeroEnabled && homepageHeroCampaigns.length ? (
        <HomepageHeroV2 campaigns={homepageHeroCampaigns} />
      ) : null}

      {settings.homeAnimationBarsEnabled ? (
        <HomepageAnimationBars bars={animationBars} placement="after-hero" />
      ) : null}

      {settings.homeFeaturedEnabled ? <FeaturedProductMotion products={featuredProducts} demo={demo} /> : null}

      {settings.homeAboutEnabled ? <HomeAboutSection settings={settings} /> : null}


      {settings.homeCatalogEnabled ? <HomeAllProductsSection products={activeProducts} demo={false} title={settings.homeCatalogTitle} eyebrow={settings.homeCatalogEyebrow} whatsappNumber={settings.whatsappNumber} /> : null}

      {settings.homeDealersEnabled ? <HomeDealerSection settings={settings} /> : null}

      {settings.homeSpotlightEnabled ? <HomeSpotlightSection
        product={mostLoved}
        badge={settings.homeSpotlightBadge}
      /> : null}
    </div>
  );
}
