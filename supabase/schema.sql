-- KLEID.IN Supabase schema
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where user_id = auth.uid()),
    false
  );
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  category text not null default 'T-Shirts',
  price integer not null check (price >= 0),
  compare_at_price integer,
  description text not null default '',
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'draft', 'sold-out')),
  image_url text,
  try_on_image_url text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Limited Time Offer',
  badge text not null default 'LIMITED TIME OFFER',
  discount_text text not null default '30%',
  description text not null default '',
  cta_label text not null default 'Shop the Offer',
  cta_href text not null default '/products',
  image_url text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  enabled boolean not null default true,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text not null default '',
  announcement_text text not null default 'New Drop Available',
  announcement_link_label text not null default 'Order on WhatsApp',
  instagram_url text not null default '',
  support_email text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.offers enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
on public.products for select
using (status <> 'draft' or public.is_admin());

drop policy if exists "Admin write products" on public.products;
create policy "Admin write products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read offers" on public.offers;
create policy "Public read offers"
on public.offers for select
using (enabled = true or public.is_admin());

drop policy if exists "Admin write offers" on public.offers;
create policy "Admin write offers"
on public.offers for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
on public.site_settings for select
using (true);

drop policy if exists "Admin write site settings" on public.site_settings;
create policy "Admin write site settings"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
using (auth.uid() = user_id or public.is_admin());

-- Product image storage
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'products');

drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images"
on storage.objects for insert
with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
on storage.objects for update
using (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
on storage.objects for delete
using (bucket_id = 'products' and public.is_admin());

-- After creating your first Supabase Auth user, grant admin manually:
-- insert into public.profiles (user_id, is_admin)
-- values ('YOUR_AUTH_USER_UUID', true)
-- on conflict (user_id) do update set is_admin = true;
