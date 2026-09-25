# KLEID.IN

KLEID.IN is currently running in **local hardcoded data mode**.

## Run locally

```bash
npm install
npm run dev
```

Storefront: `http://localhost:3000`

Admin status page: `http://localhost:3000/admin`

## Current data source

No database is required right now.

Products:

```
src/data/products.ts
```

Offers, announcement and WhatsApp settings:

```
src/data/store.ts
```

The cart is stored in browser localStorage. WhatsApp checkout will work after a full WhatsApp number with country code is added to `localStoreSettings.whatsappNumber`.

Supabase/database integration can be re-enabled later without changing the storefront UI.
