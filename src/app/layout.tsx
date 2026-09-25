import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SiteChrome } from "@/components/SiteChrome";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/site-settings";
import { store } from "@/config/store";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: store.name,
    template: `%s | ${store.name}`,
  },
  description: store.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, settings] = await Promise.all([
    getCatalogProducts(),
    getStoreSettings(),
  ]);

  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-white text-kleid-ink antialiased`}>
        <CartProvider>
          <SiteChrome products={products} settings={settings}>
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
