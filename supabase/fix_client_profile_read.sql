-- Minigroup: reliable client profile read for the logged-in customer.
-- Run this once in Supabase SQL Editor if the production project does not yet have this RPC.

create or replace function public.get_my_client_profile()
returns table (
  id uuid,
  name text,
  phone text,
  address text,
  business_type text,
  is_active boolean
)
language sql
security definer
set search_path = public
as $$
  select
    cp.id,
    cp.name,
    cp.phone,
    cp.address,
    cp.business_type,
    cp.is_active
  from public.client_profiles cp
  where cp.id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_my_client_profile() from public;
grant execute on function public.get_my_client_profile() to authenticated;

-- Keep the direct RLS read path working as well.
alter table public.client_profiles enable row level security;
drop policy if exists "clients read own profile" on public.client_profiles;
create policy "clients read own profile"
on public.client_profiles
for select
to authenticated
using (auth.uid() = id);
