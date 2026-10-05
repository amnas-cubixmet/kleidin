# KLEID.IN

KLEID.IN is a frontend-only Next.js storefront.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows:

```bash
copy .env.example .env.local
npm run dev
```

Storefront: `http://localhost:3000`

## Frontend environment settings

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SUPPORT_EMAIL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_FACEBOOK_URL=
```

Use the WhatsApp number with country code and digits only.

## Frontend data

Products are defined in:

```text
src/data/products.ts
```

Hero content is defined in:

```text
src/data/hero-slides.ts
```

Storefront copy and public contact settings are defined in:

```text
src/data/store.ts
```

The project contains no admin panel, API routes, database client, authentication backend, Cloudinary server integration, or database setup scripts.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
