create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  wholesale_slug text unique,
  category text not null default '',
  price integer not null default 0 check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  offer_enabled boolean not null default false,
  offer_type text not null default 'sale-price'
    check (offer_type in ('sale-price', 'percentage', 'fixed')),
  offer_value integer check (offer_value is null or offer_value >= 0),
  offer_label text not null default '',
  offer_badge text not null default '',
  offer_starts_at timestamptz,
  offer_ends_at timestamptz,
  offer_countdown boolean not null default false,
  wholesale_enabled boolean not null default false,
  wholesale_price integer check (wholesale_price is null or wholesale_price >= 0),
  wholesale_min_order integer check (wholesale_min_order is null or wholesale_min_order >= 1),
  description text not null default '',
  sizes text[] not null default '{}'::text[],
  colors text[] not null default '{}'::text[],
  color_variants jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  status text not null default 'draft'
    check (status in ('active', 'draft', 'sold-out')),
  image_url text,
  image_public_id text,
  try_on_image_url text,
  try_on_image_public_id text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_sort_idx
on public.products (status, sort_order, created_at desc);

create index if not exists products_featured_idx
on public.products (featured, sort_order);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'custom'
    check (kind in ('product', 'offer', 'collection', 'custom')),
  product_id uuid references public.products(id) on delete set null,
  label text not null default '',
  title text not null default '',
  subtitle text not null default '',
  button_text text not null default '',
  cta_href text not null default '',
  badge text not null default '',
  discount_text text not null default '',
  image_url text not null default '',
  image_public_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  show_countdown boolean not null default false,
  cta_style text not null default 'light'
    check (cta_style in ('light', 'dark', 'outline')),
  image_position text not null default 'center'
    check (image_position in ('left', 'center', 'right')),
  enabled boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_slides_enabled_sort_idx
on public.hero_slides (enabled, sort_order, created_at);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null,
  delivery_charge integer not null default 0 check (delivery_charge >= 0),
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  discount integer not null default 0 check (discount >= 0),
  payment_status text not null default 'Pending'
    check (payment_status in ('Pending', 'Paid', 'Cash on Delivery')),
  status text not null default 'New'
    check (status in ('New', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text not null,
  size text,
  color text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null default 0 check (unit_price >= 0),
  unit_cost integer not null default 0 check (unit_cost >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx
on public.order_items (order_id);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text not null,
  location text,
  product_image_url text,
  product_image_public_id text,
  rating integer not null default 5 check (rating between 1 and 5),
  product_slug text,
  show_on_home boolean not null default false,
  enabled boolean not null default false,
  pending boolean not null default true,
  submitted_by_customer boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_product_slug_idx
on public.testimonials (product_slug);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  link_label text not null default '',
  link_href text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  enabled boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_active_sort_idx
on public.announcements (enabled, sort_order, created_at);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.hero_slides enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.announcements enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
on public.products for select
using (status <> 'draft');

drop policy if exists "Public read enabled hero slides" on public.hero_slides;
create policy "Public read enabled hero slides"
on public.hero_slides for select
using (enabled = true);

drop policy if exists "Public read published testimonials" on public.testimonials;
create policy "Public read published testimonials"
on public.testimonials for select
using (enabled = true and pending = false);

drop policy if exists "Public read enabled announcements" on public.announcements;
create policy "Public read enabled announcements"
on public.announcements for select
using (enabled = true);

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
on public.site_settings for select
using (true);

notify pgrst, 'reload schema';
