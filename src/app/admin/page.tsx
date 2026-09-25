import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/data/products";
import { localOffers, localStoreSettings } from "@/data/store";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="admin-auth-page">
      <section className="admin-login-card local-admin-card">
        <p className="admin-kicker">KLEID.IN ADMIN</p>
        <h1>Local data mode</h1>
        <p>
          Database is disabled for now. The storefront is running entirely from
          hardcoded local data.
        </p>

        <div className="local-admin-stats">
          <div>
            <strong>{products.length}</strong>
            <span>Products</span>
          </div>
          <div>
            <strong>{localOffers.length}</strong>
            <span>Offers</span>
          </div>
        </div>

        <div className="local-admin-links">
          <code>src/data/products.ts</code>
          <code>src/data/store.ts</code>
        </div>

        <Link href="/" className="admin-primary-button local-admin-button">
          View store
        </Link>

        {localStoreSettings.whatsappNumber ? null : (
          <p className="local-admin-note">
            Add the final WhatsApp number in src/data/store.ts when ready.
          </p>
        )}
      </section>
    </main>
  );
}
