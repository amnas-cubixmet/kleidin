import Image from "next/image";
import Link from "next/link";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { TopFashionHero } from "@/components/TopFashionHero";
import { ProductActions } from "@/components/ProductActions";
import { formatPrice } from "@/lib/format";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { getActiveHeroSlides } from "@/lib/hero";
import { getProductPrimaryImage } from "@/lib/product-images";
import type { HeroSlideConfig } from "@/data/hero-slides";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, heroSlides, settings] = await Promise.all([
    getCatalogProducts(),
    getActiveHeroSlides(),
    getStoreSettings(),
  ]);

  const showcaseProducts = products
    .filter((product) => product.status === "active")
    .sort(
      (a, b) =>
        (a.sortOrder ?? a.featuredSortOrder ?? 100) -
        (b.sortOrder ?? b.featuredSortOrder ?? 100),
    );

  const defaultHeroImage = "/images/kleidin-white-shirt-model.png";

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

  return (
    <div className="reference-home">
      {resolvedHeroSlides.length ? (
        <TopFashionHero products={products} heroSlides={resolvedHeroSlides} />
      ) : null}

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
