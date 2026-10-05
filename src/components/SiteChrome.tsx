"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoreSettingsProvider } from "@/components/StoreSettingsContext";
import type { Product } from "@/types/product";
import type { StoreSettings } from "@/types/commerce";

export function SiteChrome({
  children,
  products,
  settings,
}: {
  children: React.ReactNode;
  products: Product[];
  settings: StoreSettings;
}) {
  useEffect(() => {
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
  }, []);

  return (
    <StoreSettingsProvider settings={settings}>
      <Header products={products} settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </StoreSettingsProvider>
  );
}
