import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { getCatalogProducts } from "@/lib/catalog";
import { store } from "@/config/store";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});


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
  const products = getCatalogProducts();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} min-h-screen bg-white text-kleid-ink antialiased`}
      >
        <SiteChrome products={products}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
