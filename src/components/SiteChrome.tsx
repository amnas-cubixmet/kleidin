"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { localStoreSettings } from "@/data/store";
import type { Product } from "@/types/product";

export function SiteChrome({
  children,
  products,
}: {
  children: React.ReactNode;
  products: Product[];
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
    <>
      <Header products={products} settings={localStoreSettings} />
      <main>{children}</main>
      <Footer settings={localStoreSettings} />
    </>
  );
}
