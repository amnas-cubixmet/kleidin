"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header products={products} settings={settings} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
