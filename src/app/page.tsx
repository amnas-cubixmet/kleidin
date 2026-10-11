import { getActiveGlobalOffer, getActiveHeroSlides } from "@/lib/hero";
import { getActiveAnimationBars } from "@/lib/animation-bars";
import { getMongoEnvironment } from "@/lib/server-env";
import { HomepageAnimationBars } from "@/components/HomepageAnimationBars";
import { TopFashionHero } from "@/components/TopFashionHero";
import type { HeroSlideConfig } from "@/data/hero-slides";
import { FeaturedProductMotion } from "@/components/FeaturedProductMotion";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeAllProductsSection } from "@/components/HomeAllProductsSection";
import { HomeDealerSection } from "@/components/HomeDealerSection";
import { HomeSpotlightSection } from "@/components/HomeSpotlightSection";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, settings, heroSlides, animationBars] = await Promise.all([
    getCatalogProducts(),
    getStoreSettings(),
    getActiveHeroSlides(),
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
  const activeOfferHero = getActiveGlobalOffer(heroSlides);
  const managedHeroSlides = [
    ...heroSlides.filter((slide) => slide.kind === "custom"),
    ...(activeOfferHero ? [activeOfferHero] : []),
  ]
    .sort((a, b) => a.order - b.order)
    .slice(0, 8);

  const defaultHeroSlide: HeroSlideConfig | null =
    settings.homeDefaultHeroEnabled
      ? {
          id: "default-hero",
          kind: "custom",
          productId: null,
          label: settings.homeDefaultHeroLabel,
          brand: settings.homeDefaultHeroBrand,
          title: settings.homeDefaultHeroTitle,
          subtitle: settings.homeDefaultHeroSubtitle,
          button: settings.homeDefaultHeroButtonLabel,
          href: settings.homeDefaultHeroButtonHref || "/#all-products",
          badge: "",
          imageUrl: settings.homeDefaultHeroImageUrl,
          startsAt: null,
          endsAt: null,
          showCountdown: false,
          ctaStyle: "light",
          imagePosition: settings.homeDefaultHeroImagePosition,
          enabled: true,
          order: 0,
        }
      : null;

  const homepageHeroSlides = managedHeroSlides.length
    ? managedHeroSlides
    : defaultHeroSlide
      ? [defaultHeroSlide]
      : [];

  const mostLoved = products.find(
    (product) => product.spotlight && product.status === "active",
  );
  return (
    <div className="reference-home">
      {settings.homeAnimationBarsEnabled ? (
        <HomepageAnimationBars bars={animationBars} placement="before-hero" />
      ) : null}

      {settings.homeProductHeroEnabled && homepageHeroSlides.length ? (
        <TopFashionHero
          products={activeProducts}
          heroSlides={homepageHeroSlides}
          fullscreen
        />
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
