# KLEID.IN

KLEID.IN currently uses local product/offer data with environment-based store settings.

## Run locally

```bash
npm install
```

Create your local environment file:

```bash
copy .env.example .env.local
```

On macOS/Linux:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and run:

```bash
npm run dev
```

Storefront: `http://localhost:3000`

Admin: `http://localhost:3000/admin`

## Environment settings

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_SUPPORT_EMAIL=hello@kleid.in
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_ANNOUNCEMENT_TEXT=Free shipping on prepaid orders above ₹1,999
NEXT_PUBLIC_ANNOUNCEMENT_LINK_LABEL=Shop the collection
```

Use the WhatsApp number with country code and digits only, without `+`, spaces or dashes.

`.env.local` is ignored by Git and should not be committed. `.env.example` is the safe template stored in the repository.

## Current data source

Products:

```
src/data/products.ts
```

Offers:

```
src/data/store.ts
```

Store-specific public configuration is read from `.env.local`.

## Tailwind CSS

This project uses Tailwind CSS v4 through the official PostCSS plugin.
