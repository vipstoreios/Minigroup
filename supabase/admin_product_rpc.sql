-- Run this file in Supabase SQL Editor.
-- It fixes product add/remove when RLS blocks direct insert/update.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('Rayankamal@gmail.com')
on conflict (user_id) do nothing;

create or replace function public.is_minigroup_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.admin_add_product(
  p_name text,
  p_emoji text,
  p_category text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.is_minigroup_admin() then
    raise exception 'not_admin';
  end if;

  insert into public.products (name, emoji, category, is_active)
  values (p_name, p_emoji, p_category, true)
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.admin_hide_product(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_minigroup_admin() then
    raise exception 'not_admin';
  end if;

  update public.products
  set is_active = false
  where id = p_id;
end;
$$;

grant execute on function public.is_minigroup_admin() to authenticated;
grant execute on function public.admin_add_product(text,text,text) to authenticated;
grant execute on function public.admin_hide_product(uuid) to authenticated;

alter table public.products enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "admin self read" on public.admin_users;
create policy "admin self read"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "read active products" on public.products;
create policy "read active products"
on public.products
for select
to authenticated
using (is_active = true);
