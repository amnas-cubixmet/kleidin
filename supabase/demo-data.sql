-- KLEID.IN realistic demo content
-- Use this only for staging/demo. The storefront still reads from Supabase only.
-- Run AFTER supabase/schema.sql.

insert into public.products
(
  sku, name, slug, category, price, compare_at_price, description,
  sizes, colors, stock, featured, status, image_url, sort_order
)
values
(
  'KLD-TS-101',
  'Core Heavy Tee — Washed Black',
  'core-heavy-tee-washed-black',
  'T-Shirts',
  1490,
  1790,
  '240 GSM cotton tee with a relaxed shoulder, clean neckline and washed black finish. Built for everyday rotation.',
  array['S','M','L','XL'],
  array['Washed Black'],
  18,
  true,
  'active',
  'https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=90',
  10
),
(
  'KLD-TS-102',
  'Box Fit Tee — Bone',
  'box-fit-tee-bone',
  'T-Shirts',
  1390,
  null,
  'Soft heavyweight cotton with a slightly cropped box fit and minimal finish.',
  array['S','M','L','XL'],
  array['Bone'],
  22,
  true,
  'active',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=90',
  20
),
(
  'KLD-TS-103',
  'Daily Tee — Cobalt',
  'daily-tee-cobalt',
  'T-Shirts',
  1290,
  1490,
  'Everyday cotton jersey tee in KLEID.IN cobalt with a straight relaxed fit.',
  array['S','M','L','XL'],
  array['Cobalt Blue'],
  11,
  true,
  'active',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=90',
  30
),
(
  'KLD-SH-201',
  'Relaxed Oxford Shirt — White',
  'relaxed-oxford-shirt-white',
  'Shirts',
  2290,
  2590,
  'A clean oxford shirt with a relaxed body, soft collar and easy everyday structure.',
  array['S','M','L','XL'],
  array['White'],
  13,
  true,
  'active',
  'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=90',
  40
),
(
  'KLD-SH-202',
  'Resort Shirt — Slate',
  'resort-shirt-slate',
  'Shirts',
  2190,
  null,
  'Lightweight open-collar shirt designed for warm days and clean layered styling.',
  array['S','M','L','XL'],
  array['Slate'],
  9,
  false,
  'active',
  'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1400&q=90',
  50
),
(
  'KLD-OS-301',
  'Utility Overshirt — Midnight',
  'utility-overshirt-midnight',
  'Overshirts',
  2990,
  3390,
  'Midweight overshirt with utility pockets, matte hardware and a straight relaxed fit.',
  array['M','L','XL'],
  array['Midnight Navy'],
  7,
  true,
  'active',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=90',
  60
),
(
  'KLD-OS-302',
  'Work Overshirt — Sand',
  'work-overshirt-sand',
  'Overshirts',
  2890,
  null,
  'A clean workwear-inspired outer layer in a soft sand tone, made for easy layering.',
  array['S','M','L','XL'],
  array['Sand'],
  6,
  false,
  'active',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=90',
  70
),
(
  'KLD-KN-401',
  'Essential Knit — Charcoal',
  'essential-knit-charcoal',
  'Knitwear',
  2490,
  2890,
  'Soft fine-gauge knit with a minimal crew neck and clean ribbed finish.',
  array['S','M','L','XL'],
  array['Charcoal'],
  8,
  false,
  'active',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=90',
  80
),
(
  'KLD-BT-501',
  'Relaxed Trouser — Black',
  'relaxed-trouser-black',
  'Bottoms',
  2590,
  null,
  'Straight relaxed trouser with a clean front, soft drape and everyday comfort.',
  array['28','30','32','34','36'],
  array['Black'],
  15,
  true,
  'active',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1400&q=90',
  90
),
(
  'KLD-BT-502',
  'Everyday Trouser — Stone',
  'everyday-trouser-stone',
  'Bottoms',
  2490,
  2790,
  'Minimal straight-leg trouser with a soft stone finish and easy waist construction.',
  array['28','30','32','34','36'],
  array['Stone'],
  10,
  false,
  'active',
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1400&q=90',
  100
),
(
  'KLD-AC-601',
  'Logo Cap — Black',
  'logo-cap-black',
  'Accessories',
  990,
  null,
  'Six-panel cotton cap with subtle KLEID.IN branding and adjustable back strap.',
  array['One Size'],
  array['Black'],
  24,
  false,
  'active',
  'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1400&q=90',
  110
),
(
  'KLD-AC-602',
  'Canvas Tote — Natural',
  'canvas-tote-natural',
  'Accessories',
  790,
  null,
  'Heavy canvas everyday tote with a minimal front mark and reinforced handles.',
  array['One Size'],
  array['Natural'],
  19,
  false,
  'active',
  'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1400&q=90',
  120
)
on conflict (sku) do update set
  name = excluded.name,
  slug = excluded.slug,
  category = excluded.category,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  description = excluded.description,
  sizes = excluded.sizes,
  colors = excluded.colors,
  stock = excluded.stock,
  featured = excluded.featured,
  status = excluded.status,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.offers
(
  title, badge, discount_text, description, cta_label, cta_href,
  image_url, starts_at, ends_at, enabled, priority
)
values
(
  'Weekend Edit',
  'WEEKEND OFFER',
  '20%',
  'Selected everyday essentials at a limited-time price.',
  'Shop the Edit',
  '/products?new=1',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=92',
  now(),
  now() + interval '72 hours',
  true,
  100
),
(
  'New Season',
  'NEW SEASON',
  '15%',
  'Fresh layers and clean essentials for the new rotation.',
  'Explore New Arrivals',
  '/products?new=1',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=92',
  now(),
  now() + interval '7 days',
  true,
  80
);

update public.site_settings
set
  announcement_text = 'Free shipping on orders above ₹1,999',
  announcement_link_label = 'Shop now',
  updated_at = now()
where id = 1;
