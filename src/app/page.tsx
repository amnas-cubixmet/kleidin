import Image from "next/image";
import Link from "next/link";
import { HomeProductCatalog } from "@/components/HomeProductCatalog";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { TopFashionHero } from "@/components/TopFashionHero";
import { ProductActions } from "@/components/ProductActions";
import { HomepageAnimationBars } from "@/components/HomepageAnimationBars";
import { formatPrice } from "@/lib/format";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { getActiveHeroSlides } from "@/lib/hero";
import { getProductPrimaryImage } from "@/lib/product-images";
import { getActiveAnimationBars } from "@/lib/animation-bars";
import type { HeroSlideConfig } from "@/data/hero-slides";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, heroSlides, settings, animationBars] = await Promise.all([
    getCatalogProducts(),
    getActiveHeroSlides(),
    getStoreSettings(),
    getActiveAnimationBars(),
  ]);

  const featured = products
    .filter(
      (product) => product.featured && product.status === "active",
    )
    .sort(
      (a, b) =>
        (a.featuredSortOrder ?? a.sortOrder ?? 100) -
        (b.featuredSortOrder ?? b.sortOrder ?? 100),
    );

  const showcaseProducts = products
    .filter(
      (product) =>
        product.featuredAnimationEnabled && product.status === "active",
    )
    .sort(
      (a, b) =>
        (a.animationSortOrder ??
          a.featuredSortOrder ??
          a.sortOrder ??
          100) -
        (b.animationSortOrder ??
          b.featuredSortOrder ??
          b.sortOrder ??
          100),
    );

  const defaultHeroFallbackProduct = products.find(
    (product) =>
      product.status === "active" && Boolean(getProductPrimaryImage(product)),
  );
  const defaultHeroImage =
    settings.homeDefaultHeroImageUrl ||
    (defaultHeroFallbackProduct
      ? getProductPrimaryImage(defaultHeroFallbackProduct)
      : "");

  const resolvedHeroSlides: HeroSlideConfig[] = [
    ...(settings.homeDefaultHeroEnabled
      ? [
          {
            id: "default-home-hero",
            kind: "custom" as const,
            label: "",
            title: "WEAR IT\nEVERY DAY.",
            subtitle: "Premium everyday T-shirts designed for comfort, fit, and effortless style.",
            button: "SHOP T-SHIRTS",
            href: "/products",
            badge: "",
            imageUrl: defaultHeroImage,
            enabled: true,
            order: -100000,
            ctaStyle: "dark" as const,
            imagePosition: settings.homeDefaultHeroImagePosition,
          },
        ]
      : []),
    ...heroSlides,
  ];

  const mostLoved = products.find(
    (product) => product.spotlight && product.status === "active",
  );
  const mostLovedImage = mostLoved
    ? getProductPrimaryImage(mostLoved)
    : "";
  const brandTitleLines = settings.homeBrandTitle.split("\n");
  const dealerHref = products.length ? "/wholesale" : "/contact";

  return (
    <div className="reference-home">
      {resolvedHeroSlides.length ? (
        <TopFashionHero products={products} heroSlides={resolvedHeroSlides} />
      ) : null}

      {showcaseProducts.length ? (
        <AutoOutfitHero products={showcaseProducts} />
      ) : null}

      <section className="ref-brand-strip" aria-label="About KLEID.IN">
        <div className="ref-brand-strip-inner">
          <p>{settings.homeBrandEyebrow}</p>
          <h2>
            {brandTitleLines.map((line, index) => (
              <span key={line + index}>
                {line}
                {index < brandTitleLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h2>
          <Link href="/about" className="ref-pill ref-pill-light">
            {settings.homeAboutButtonLabel}
          </Link>
        </div>
      </section>

      <HomepageAnimationBars
        bars={animationBars}
        placement="after-hero"
      />

      {featured.length ? (
        <HomeProductCatalog
          products={featured}
          eyebrow={settings.homeCatalogEyebrow}
          title={settings.homeCatalogTitle}
        />
      ) : null}

      <section className="home-dealers-clean">
        <div>
          <p>{settings.homeDealersEyebrow}</p>
          <h2>{settings.homeDealersTitle}</h2>
          <span>{settings.homeDealersBody}</span>
          <Link href={dealerHref}>{settings.homeDealersButtonLabel}</Link>
        </div>
        <div className="home-dealers-copy">
          {settings.homeDealerTags.map((tag) => (
            <strong key={tag}>{tag}</strong>
          ))}
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
