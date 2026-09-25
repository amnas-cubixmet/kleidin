# KLEID.IN

Production-oriented Next.js fashion storefront with a mobile-first UI, persistent cart, WhatsApp ordering, Supabase database integration, Supabase Storage product images, timed offers, and a protected admin panel.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Storefront: `http://localhost:3000`

Admin: `http://localhost:3000/admin`

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Put the project URL and anon key in `.env.local`.
4. Create the admin user in Supabase Authentication.
5. Copy that user's UUID and run:

```sql
insert into public.profiles (user_id, is_admin)
values ('YOUR_AUTH_USER_UUID', true)
on conflict (user_id) do update set is_admin = true;
```

The admin panel can then manage products, product images, transparent try-on garment assets, multiple timed offers, WhatsApp number, announcement text, Instagram URL and support email.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

If Supabase is not configured, the public storefront falls back to the demo catalog in `src/data/products.ts`.

## Commerce flow

- Cart persists in browser localStorage.
- Cart opens as a drawer, not a separate page.
- WhatsApp checkout builds an order message from the cart.
- Product data comes from Supabase when configured.
- Images are stored in the public Supabase Storage bucket `products`.
