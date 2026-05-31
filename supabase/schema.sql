-- Minigroup Supabase schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.client_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  business_type text,
  phone text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  client_email text,
  place_type text not null,
  needed_at timestamptz,
  phone text not null,
  address text not null,
  items jsonb not null,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.client_profiles enable row level security;
alter table public.orders enable row level security;

-- Clients can read only their own profile.
drop policy if exists "clients read own profile" on public.client_profiles;
create policy "clients read own profile"
on public.client_profiles
for select
to authenticated
using (auth.uid() = id and is_active = true);

-- Clients can create their own order only.
drop policy if exists "clients create own orders" on public.orders;
create policy "clients create own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

-- Clients can read only their own orders.
drop policy if exists "clients read own orders" on public.orders;
create policy "clients read own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

-- Helpful indexes.
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_created_at_idx on public.orders(status, created_at desc);
