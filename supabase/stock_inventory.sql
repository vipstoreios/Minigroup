alter table public.products
add column if not exists stock_kg numeric not null default 0;

update public.products
set stock_kg = 0
where stock_kg is null;

create or replace function public.decrease_product_stock(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  product_id uuid;
  amount numeric;
  unit_text text;
  amount_kg numeric;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    product_id := (item->>'id')::uuid;
    amount := coalesce((item->>'amount')::numeric, 0);
    unit_text := coalesce(item->>'unit', 'kg');
    amount_kg := case when unit_text = 'g' then amount / 1000 else amount end;

    update public.products
    set stock_kg = greatest(stock_kg - amount_kg, 0)
    where id = product_id;
  end loop;
end;
$$;

grant execute on function public.decrease_product_stock(jsonb) to authenticated;
