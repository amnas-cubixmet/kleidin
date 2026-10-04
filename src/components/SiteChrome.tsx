"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Product } from "@/types/product";
import type { StoreSettings } from "@/types/commerce";
import type { Announcement } from "@/types/announcement";

export function SiteChrome({
  children,
  products,
  settings,
  announcements,
}: {
  children: React.ReactNode;
  products: Product[];
  settings: StoreSettings;
  announcements: Announcement[];
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
    <>
      <Header products={products} settings={settings} announcements={announcements} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
