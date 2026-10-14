# KLEID.IN

KLEID.IN is a Next.js ecommerce storefront with a built-in Next.js API backend and admin control panel.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- MongoDB Atlas
- Cloudinary

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows:

```bash
copy .env.example .env.local
npm run dev
```

Storefront: `http://localhost:3000`  
Admin: `http://localhost:3000/admin`  
Health: `http://localhost:3000/api/health`

## Environment variables

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SUPPORT_EMAIL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_FACEBOOK_URL=

MONGODB_URI=
MONGODB_DB=kleidin

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit real secrets to GitHub. Configure the same private variables in Vercel Project Settings for Production.


## Load realistic sample products directly into MongoDB

The `scripts/seed-demo.mjs` command seeds **fictional** KLEID.IN catalogue products into MongoDB, without using the Admin UI or exposing any new web API. The supplied JSON includes eight realistic items with names, SKUs, Indian-rupee prices, stock by size, colours, descriptions and approved sample images.

**Important:** This is for demo/staging and design previews, not real inventory. Inserted products have `demo: true` and `seedSource: "kleidin-demo-products-v1"`. The storefront labels them **Demo preview** and disables checkout/WhatsApp orders. Real products, customers and orders are never replaced or generated.

1. Configure a separate Atlas database in `.env.local` (do **not** commit secrets):

   ```env
   MONGODB_URI=mongodb+srv://<your-user>:<your-password>@<your-cluster-host>/
   MONGODB_DB=kleidin_demo
   ```

2. Install dependencies and inspect the sample data **without writing to MongoDB**:

   ```bash
   npm install
   npm run db:seed:demo
   ```

3. Apply the verified sample data to the explicitly selected database:

   ```bash
   npm run db:seed:demo -- --apply --confirm-db=kleidin_demo
   ```

4. Optional: import your own similarly structured product JSON file, or insert sample data as hidden drafts:

   ```bash
   npm run db:seed:demo -- --file=scripts/fixtures/demo-products.json
   npm run db:seed:demo -- --apply --confirm-db=kleidin_demo --draft
   ```

The importer validates image hostnames, types, SKUs, duplicate slugs and stock counts before writing. Rerunning skips existing records from this exact seed batch. If a SKU/slug collides with a real record, the import aborts. Existing records are never overwritten. MongoDB's unique indexes protect the product identifiers.

The command **refuses** database writes without `--apply` and an exact `--confirm-db`. A database name without `demo`, `dev`, `test`, `staging` or `sandbox` additionally requires `--allow-live-db`, which should be avoided for real stores. It also refuses `NODE_ENV=production`. Never run against the production store merely to fill a demo.

To view the inserted data at `/products`, the running Next.js app must point to the **same** `MONGODB_URI` and `MONGODB_DB`; changes to local `.env.local` do not automatically change Vercel configuration. You can disable the separate frontend-only `demoProductsEnabled` fallback under site settings if you wish to show only MongoDB records. No database write is executed during deployment, `npm install` or `npm run build`.

Run validation tests with `npm test`. The GitHub pull-request workflow also runs these tests.

## Admin control

The admin panel includes:

- Dashboard KPIs
- Product create/edit/delete
- Product images through direct Cloudinary uploads
- Featured and featured-animation controls
- Dealer/wholesale product fields
- Inventory adjustments and stock history
- Manual order creation
- Order status, payment status, courier and tracking controls
- Automatic stock deduction and restore on cancellation/return/refund
- Customer list, notes and block/active control
- Homepage hero management
- Storefront/Home/About/social settings

## Backend API

Admin APIs live under `/api/admin/*` and require the secure HttpOnly admin session cookie.

Main routes:

```text
/api/admin/session
/api/admin/dashboard
/api/admin/products
/api/admin/products/:id
/api/admin/inventory
/api/admin/orders
/api/admin/orders/:id
/api/admin/customers
/api/admin/customers/:id
/api/admin/hero
/api/admin/hero/:id
/api/admin/settings
/api/admin/uploads/signature
```

MongoDB indexes are created automatically when the backend connects.

## Frontend fallback

If MongoDB is not configured or temporarily unavailable, the public storefront falls back to the local data/config in `src/data` so the site can still render.

Section visibility is managed in Admin → Settings → Edit settings → Section visibility. All new section switches default to On, including for existing databases. Save applies the switches to the storefront without deleting content. Footer visibility applies across public pages.

Copy `.env.example` to `.env.local` for local setup, or set these variables on the hosting server. MongoDB, admin credentials and signed Cloudinary upload credentials are required for live administration. `/api/health` returns 503 until these are configured and the database responds; Admin Settings shows the connection status. Without MongoDB configuration the storefront is a demo. A configured database failure displays an error rather than sample inventory.
