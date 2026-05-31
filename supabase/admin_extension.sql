create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '🥬',
  category text not null default 'keskati',
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.products enable row level security;

create policy "admin self read"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

create policy "read active products"
on public.products
for select
to authenticated
using (is_active = true);

create policy "admin add products"
on public.products
for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admin edit products"
on public.products
for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admin read clients"
on public.client_profiles
for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admin add clients"
on public.client_profiles
for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admin edit clients"
on public.client_profiles
for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admin read orders"
on public.orders
for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admin edit orders"
on public.orders
for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

insert into public.products (name, emoji, category, sort_order)
values
  ('تەماتە', '🍅', 'keskati', 10),
  ('خەیار', '🥒', 'keskati', 20),
  ('کاهو', '🥬', 'keskati', 30),
  ('پەتاتە', '🥔', 'keskati', 40),
  ('پیاز', '🧅', 'keskati', 50),
  ('بێبەر', '🫑', 'keskati', 60),
  ('گێزەر', '🥕', 'keskati', 70),
  ('لیمۆ', '🍋', 'fruit', 80),
  ('سێڤ', '🍎', 'fruit', 90),
  ('مۆز', '🍌', 'fruit', 100),
  ('پرتەقاڵ', '🍊', 'fruit', 110),
  ('تری', '🍇', 'fruit', 120)
on conflict do nothing;
