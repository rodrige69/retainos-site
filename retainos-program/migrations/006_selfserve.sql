-- 006_selfserve.sql
-- Self-serve onboarding: a signed-in user creates their own shop, its staff rows
-- and their own owner link in one call. Replaces the platform-admin step from
-- 005 for the normal signup path; onboard_shop stays for support and migrations.
--
-- Rules kept from 005: same slug rules, same milestone/stamps bounds, same
-- defaults from business_types, same join URL shape.

create or replace function public.create_my_shop(p_shop jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_slug   text;
  v_name   text;
  v_bt     text;
  v_mile   int;
  v_start  int;
  v_days   int;
  v_owned  text;
  v_staff  jsonb;
  v_row    jsonb;
  v_n      int := 0;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'auth_required');
  end if;

  -- One shop per login: the second attempt returns the first, never a duplicate.
  select shop_id into v_owned from public.shop_owners where user_id = v_uid limit 1;
  if v_owned is not null then
    return jsonb_build_object('ok', false, 'error', 'already_owned', 'shop_id', v_owned);
  end if;

  v_name := btrim(coalesce(p_shop->>'name', ''));
  if length(v_name) < 2 then
    return jsonb_build_object('ok', false, 'error', 'bad_name');
  end if;

  v_bt := btrim(coalesce(p_shop->>'business_type', ''));
  if not exists (select 1 from public.business_types where key = v_bt) then
    return jsonb_build_object('ok', false, 'error', 'bad_type');
  end if;
  select rebook_days into v_days from public.business_types where key = v_bt;

  v_slug := lower(btrim(coalesce(nullif(p_shop->>'slug', ''), v_name)));
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := btrim(v_slug, '-');
  if length(v_slug) < 2 then
    return jsonb_build_object('ok', false, 'error', 'bad_slug');
  end if;
  if exists (select 1 from public.shops where id = v_slug) then
    return jsonb_build_object('ok', false, 'error', 'slug_taken', 'slug', v_slug);
  end if;

  v_mile  := coalesce((p_shop->>'milestone')::int, 5);
  v_start := coalesce((p_shop->>'stamps_at_join')::int, 2);
  if v_mile < 2 or v_mile > 12 then
    return jsonb_build_object('ok', false, 'error', 'bad_milestone');
  end if;
  if v_start < 0 or v_start >= v_mile then
    return jsonb_build_object('ok', false, 'error', 'bad_start');
  end if;

  insert into public.shops
    (id, name, industry, business_type, plan, texts_included, milestone,
     booking_tool, booking_link, default_language, timezone, status,
     stamps_at_join, destination_tier, city, state, zip, phone,
     onboarded_at, onboarded_by)
  values
    (v_slug, v_name,
     coalesce(nullif(btrim(coalesce(p_shop->>'industry', '')), ''),
              (select industry from public.business_types where key = v_bt)),
     v_bt,
     coalesce(nullif(p_shop->>'plan', ''), 'regulars'),
     coalesce((p_shop->>'texts')::int, 100),
     v_mile,
     nullif(btrim(coalesce(p_shop->>'booking_tool', '')), ''),
     nullif(btrim(coalesce(p_shop->>'booking_link', '')), ''),
     coalesce(nullif(p_shop->>'language', ''), 'en'),
     coalesce(nullif(p_shop->>'timezone', ''), 'America/New_York'),
     'active',
     v_start,
     coalesce(nullif(p_shop->>'destination_tier', ''), 'domestic'),
     nullif(btrim(coalesce(p_shop->>'city', '')), ''),
     nullif(btrim(coalesce(p_shop->>'state', '')), ''),
     nullif(btrim(coalesce(p_shop->>'zip', '')), ''),
     nullif(btrim(coalesce(p_shop->>'phone', '')), ''),
     now(), v_uid);

  insert into public.shop_owners (user_id, shop_id, role)
  values (v_uid, v_slug, 'owner');

  v_staff := coalesce(p_shop->'staff', '[]'::jsonb);
  for v_row in select value from jsonb_array_elements(v_staff) loop
    if length(btrim(coalesce(v_row->>'name', ''))) > 0 then
      insert into public.staff (shop_id, name, role, active)
      values (v_slug, btrim(v_row->>'name'),
              coalesce(nullif(btrim(coalesce(v_row->>'role', '')), ''), 'staff'), true);
      v_n := v_n + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'shop_id', v_slug,
    'name', v_name,
    'join_url', 'https://app.retainos.co/join.html?shop=' || v_slug,
    'staff', v_n,
    'milestone', v_mile,
    'stamps_at_join', v_start,
    'rebook_days', v_days);
end;
$$;

revoke all on function public.create_my_shop(jsonb) from public;
revoke all on function public.create_my_shop(jsonb) from anon;
grant execute on function public.create_my_shop(jsonb) to authenticated;
