# KLEID.IN

Minimal fashion storefront built with Next.js App Router and TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Product management

All product records currently live in:

```
src/data/products.ts
```

Each product supports ID, SKU, name, slug, category, price, compare-at price, description, sizes, colours, stock, featured state, and status.

Product status can be `active`, `draft`, or `sold-out`.

## WhatsApp orders

Copy `.env.example` to `.env.local` and set your number with country code only:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
```

No payment gateway is configured.

## Routes

- `/` — Home
- `/products` — Product listing
- `/products/[slug]` — Product details
- `/about` — About
- `/contact` — Contact / WhatsApp
