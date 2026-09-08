-- Bouclescence — schéma e-commerce initial.
-- Migration additive : aucune table ni donnée existante n'est supprimée.

create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('customer', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.product_status as enum ('draft', 'active', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.inventory_movement_type as enum ('initial', 'manual_adjustment', 'sale', 'refund', 'return', 'cancellation'); exception when duplicate_object then null; end $$;
do $$ begin create type public.discount_type as enum ('percentage', 'fixed_amount'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  status public.product_status not null default 'draft',
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  sku text unique,
  stock_tracking boolean not null default true,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 2 check (low_stock_threshold >= 0),
  is_unique_piece boolean not null default false,
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_piece_stock_limit check (not is_unique_piece or stock_quantity <= 1)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique(product_id, storage_path)
);
create unique index if not exists product_images_one_primary on public.product_images(product_id) where is_primary;
create index if not exists product_images_product_sort on public.product_images(product_id, sort_order);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  options jsonb not null default '{}'::jsonb,
  sku text not null unique,
  price integer check (price is null or price >= 0),
  stock_tracking boolean not null default true,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer check (low_stock_threshold is null or low_stock_threshold >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_variants_product on public.product_variants(product_id, sort_order);

create table if not exists public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists customers_email_lower_unique on public.customers(lower(email));

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null default 'shipping' check (type in ('shipping', 'billing')),
  first_name text not null,
  last_name text not null,
  company text,
  line1 text not null,
  line2 text,
  postal_code text not null,
  city text not null,
  country_code char(2) not null default 'FR',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  status public.order_status not null default 'pending',
  email text not null,
  currency char(3) not null default 'EUR',
  subtotal integer not null check (subtotal >= 0),
  discount_total integer not null default 0 check (discount_total >= 0),
  shipping_total integer not null default 0 check (shipping_total >= 0),
  tax_total integer not null default 0 check (tax_total >= 0),
  total integer not null check (total >= 0),
  shipping_address jsonb not null,
  billing_address jsonb not null,
  tracking_number text,
  tracking_url text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create sequence if not exists public.order_number_seq start 1;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  sku text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  total integer not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  movement_type public.inventory_movement_type not null,
  quantity_before integer not null,
  quantity_change integer not null check (quantity_change <> 0),
  quantity_after integer not null check (quantity_after >= 0),
  reason text not null check (length(trim(reason)) > 0),
  reference text,
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint inventory_target_consistency check (variant_id is null or product_id is not null),
  constraint inventory_math check (quantity_after = quantity_before + quantity_change)
);
create index if not exists inventory_movements_product_date on public.inventory_movements(product_id, created_at desc);
create index if not exists inventory_movements_variant_date on public.inventory_movements(variant_id, created_at desc) where variant_id is not null;

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.discount_type not null,
  value integer not null check (value > 0),
  minimum_amount integer check (minimum_amount is null or minimum_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  times_used integer not null default 0 check (times_used >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discount_dates check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint percentage_limit check (type <> 'percentage' or value <= 10000)
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','collections','products','product_variants','customers','addresses','orders','discount_codes','site_settings'] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name') on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.next_order_number() returns text language sql security definer set search_path = '' as $$
  select 'BC-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
$$;
revoke all on function public.next_order_number() from public, anon, authenticated;
alter table public.orders alter column order_number set default public.next_order_number();

comment on column public.products.price is 'Prix en centimes EUR.';
comment on column public.products.compare_at_price is 'Prix barré en centimes EUR.';
comment on column public.product_variants.price is 'Prix de variante en centimes, NULL pour hériter du produit.';
comment on column public.discount_codes.value is 'Pourcentage en points de base (1000 = 10 %) ou montant fixe en centimes.';
