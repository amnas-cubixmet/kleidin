"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ProductImageTransition } from "@/components/ProductImageTransition";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoreSettingsProvider } from "@/components/StoreSettingsContext";
import type { Product } from "@/types/product";
import type { StoreSettings } from "@/types/commerce";
import type { AnimationBarConfig } from "@/types/animation-bar";
import { HomepageAnimationBars } from "@/components/HomepageAnimationBars";

export function SiteChrome({
  children,
  products,
  settings,
  animationBars,
}: {
  children: React.ReactNode;
  products: Product[];
  settings: StoreSettings;
  animationBars: AnimationBarConfig[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    let frame = 0;
    const lockViewportX = () => {
      if (window.scrollX === 0) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const top = window.scrollY;
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
        window.scrollTo(0, top);
      });
    };

    window.addEventListener("scroll", lockViewportX, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", lockViewportX);
    };
  }, [isAdmin]);

  if (isAdmin) return <>{children}</>;

  return (
    <StoreSettingsProvider settings={settings}>
      {pathname === "/" ? (
        <HomepageAnimationBars
          bars={animationBars}
          placement="before-hero"
        />
      ) : null}
      <ProductImageTransition />
      <Header products={products} settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </StoreSettingsProvider>
  );
}
