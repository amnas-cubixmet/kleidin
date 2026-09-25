-- Optional KLEID.IN demo seed.
-- Run after supabase/schema.sql.

insert into public.products
(sku, name, slug, category, price, compare_at_price, description, sizes, colors, stock, featured, status, image_url, sort_order)
values
('KLD-TS-001','Essential Tee — Black','essential-tee-black','T-Shirts',1299,1599,'A clean everyday T-shirt with a relaxed silhouette and soft hand feel.',array['S','M','L','XL'],array['Black'],24,true,'active','https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1200&q=88',10),
('KLD-TS-002','Essential Tee — White','essential-tee-white','T-Shirts',1299,1599,'A minimal white everyday T-shirt designed for easy layering and repeat wear.',array['S','M','L','XL'],array['White'],18,true,'active','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=88',20),
('KLD-TS-003','Heavyweight Tee — Graphite','heavyweight-tee-graphite','T-Shirts',1699,null,'A structured heavyweight T-shirt with a premium drape and substantial feel.',array['M','L','XL'],array['Graphite'],12,true,'active','https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=88',30),
('KLD-SH-001','Everyday Shirt — Sky','everyday-shirt-sky','Shirts',2199,null,'An easy long-sleeve shirt with a clean collar and relaxed everyday proportion.',array['S','M','L','XL'],array['Sky Blue'],14,true,'active','https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=88',40),
('KLD-OS-001','Utility Overshirt — Navy','utility-overshirt-navy','Overshirts',2799,null,'A lightweight overshirt built for layering over tees and shirts.',array['S','M','L','XL'],array['Navy'],9,true,'active','https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=88',50),
('KLD-SH-002','Relaxed Shirt — White','relaxed-shirt-white','Shirts',1999,null,'A versatile white shirt with a relaxed body and clean minimal finish.',array['S','M','L','XL'],array['White'],20,true,'active','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=88',60),
('KLD-TS-004','Relaxed Tee — Stone','relaxed-tee-stone','T-Shirts',1499,null,'An easy relaxed-fit T-shirt in a versatile stone tone.',array['S','M','L','XL'],array['Stone'],16,true,'active','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=88',70),
('KLD-OS-002','Core Overshirt — Black','core-overshirt-black','Overshirts',2899,null,'A black overshirt with clean pockets and an easy straight fit.',array['M','L','XL'],array['Black'],7,true,'active','https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=88',80)
on conflict (sku) do nothing;

insert into public.offers
(title,badge,discount_text,description,cta_label,cta_href,image_url,starts_at,ends_at,enabled,priority)
values
(
  'Launch Offer',
  'LIMITED TIME OFFER',
  '30%',
  'Upgrade your everyday wardrobe. Premium style for everyone.',
  'Shop the Offer',
  '/products?new=1',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1600&q=92',
  now(),
  now() + interval '3 days',
  true,
  100
)
on conflict do nothing;
