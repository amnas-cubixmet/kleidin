import Link from "next/link";
import { HomeProductCatalog } from "@/components/HomeProductCatalog";
import { AutoOutfitHero } from "@/components/AutoOutfitHero";
import { TopFashionHero } from "@/components/TopFashionHero";
import { HomepageAnimationBars } from "@/components/HomepageAnimationBars";
import { getWhatsappUrl } from "@/lib/format";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { getActiveHeroSlides } from "@/lib/hero";
import { getActiveAnimationBars } from "@/lib/animation-bars";
import { HomeProductRail } from "@/components/HomeProductRail";
import { HomeShoppingMotion } from "@/components/HomeShoppingMotion";
import styles from "@/components/ShoppingHome.module.css";
import type { HeroSlideConfig } from "@/data/hero-slides";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, heroSlides, settings, animationBars] = await Promise.all([
    getCatalogProducts(),
    getActiveHeroSlides(),
    getStoreSettings(),
    getActiveAnimationBars(),
  ]);

  const activeProducts = products.filter((product) => product.status !== "draft");

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

  const resolvedHeroSlides: HeroSlideConfig[] = [
    ...(settings.homeDefaultHeroEnabled
      ? [
          {
            id: "default-hero",
            kind: "custom" as const,
            label: settings.homeDefaultHeroLabel,
            brand: settings.homeDefaultHeroBrand,
            title: settings.homeDefaultHeroTitle,
            subtitle: settings.homeDefaultHeroSubtitle,
            button: settings.homeDefaultHeroButtonLabel,
            href: settings.homeDefaultHeroButtonHref === "/products" ? "#shop-products" : settings.homeDefaultHeroButtonHref,
            badge: "",
            imageUrl: settings.homeDefaultHeroImageUrl,
            enabled: true,
            order: -100000,
            ctaStyle: "dark" as const,
            imagePosition: settings.homeDefaultHeroImagePosition,
          },
        ]
      : []),
    ...heroSlides,
  ];

  const whatsappHref = getWhatsappUrl(undefined, settings.whatsappNumber);

  return (
    <div className={styles.home}>
      <HomeShoppingMotion />
      {resolvedHeroSlides.length ? <TopFashionHero products={products} heroSlides={resolvedHeroSlides} /> : null}
      <nav className={styles.quickNav} aria-label="Shop this page">
        <a href="#shop-products">Shop all products <span aria-hidden="true">↘</span></a>
        <a href="#how-to-order">How to order</a>
        {whatsappHref !== "#" ? <a href={whatsappHref} target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a> : null}
      </nav>

      <section id="about-kleid" className={styles.about} data-shop-reveal aria-label="About KLEID.IN">
        <div><p className={styles.kicker}>{settings.homeBrandEyebrow}</p><h2 className={styles.brandTitle}>{settings.homeBrandTitle}</h2></div>
        <div className={styles.aboutCopy}>
          <p>Everyday pieces. Your own way.</p>
          <p>Explore the collection, choose your colour and size, and order directly with us on WhatsApp. Simple from the first look to the final confirmation.</p>
          <Link href="/about" className={styles.textLink}>{settings.homeAboutButtonLabel} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <HomepageAnimationBars bars={animationBars} placement="after-hero" />
      <HomeProductCatalog products={activeProducts} eyebrow="THE COLLECTION" title="All products" />
      {showcaseProducts.length ? <section className={styles.showcase} aria-label="Product showcase" data-shop-reveal><AutoOutfitHero products={showcaseProducts} /></section> : null}
      <HomeProductRail products={activeProducts} />

      <section id="how-to-order" className={styles.order} data-shop-reveal aria-labelledby="order-heading">
        <div className={styles.sectionHead}><div><p className={styles.kicker}>FROM A LOOK TO YOUR DOOR</p><h2 id="order-heading">How to order.</h2></div><a href="#shop-products" className={styles.textLink}>Find your piece ↗</a></div>
        <ol className={styles.steps}>
          <li><span>01</span><h3>Find your favourite.</h3><p>Browse all products above. Open a product to see its images, colours, sizes and price.</p></li>
          <li><span>02</span><h3>Send it on WhatsApp.</h3><p>Choose your colour and size, then tap Order on WhatsApp. Your product details are ready in the message.</p></li>
          <li><span>03</span><h3>Confirm with us.</h3><p>Send the message. We will confirm availability, delivery details and payment before your order is placed.</p></li>
        </ol>
        <div className={styles.orderBottom}><p>Need a hand choosing? Talk to us.</p>{whatsappHref !== "#" ? <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.whatsappButton}>Chat on WhatsApp <span aria-hidden="true">↗</span></a> : <Link href="/contact" className={styles.whatsappButton}>Contact us ↗</Link>}</div>
      </section>
    </div>
  );
}
