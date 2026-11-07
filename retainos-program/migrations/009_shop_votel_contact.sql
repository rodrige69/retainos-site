-- 009_shop_votel_contact.sql
-- Every shop gets a home in Votel: one contact per business, tagged the way the
-- existing shop-owner contacts already are (ros-shop-owner, ros-shop:<slug>,
-- ros-niche:<business_type>, ros-industry:<group>, ros-plan:<plan>).
--
-- The contact itself is created by app/api/votel-shop.js, because the Votel key
-- cannot live in a static page. That function writes the id back through the RPC
-- below, which only accepts a caller who owns the shop.

alter table public.shops add column if not exists votel_contact_id text;
alter table public.shops add column if not exists votel_synced_at timestamptz;

create or replace function public.set_shop_votel_contact(p_shop text, p_contact text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'auth_required');
  end if;
  if not exists (
    select 1 from public.shop_owners where shop_id = p_shop and user_id = auth.uid()
  ) then
    return jsonb_build_object('ok', false, 'error', 'not_owner');
  end if;

  update public.shops
     set votel_contact_id = nullif(btrim(coalesce(p_contact, '')), ''),
         votel_synced_at  = case
           when nullif(btrim(coalesce(p_contact, '')), '') is null then null
           else now()
         end
   where id = p_shop;

  return jsonb_build_object('ok', true, 'shop_id', p_shop);
end;
$$;

revoke all on function public.set_shop_votel_contact(text, text) from public;
revoke all on function public.set_shop_votel_contact(text, text) from anon;
grant execute on function public.set_shop_votel_contact(text, text) to authenticated;
