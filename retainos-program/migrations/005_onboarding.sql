-- 005_onboarding.sql
-- Shop onboarding: one atomic RPC that creates the shop, its staff rows and the owner invites.
-- Run by a platform admin (currently danrodlife@gmail.com) from app/setup.html.

create table if not exists public.platform_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;

insert into public.platform_admins (email)
values ('danrodlife@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
      from public.platform_admins a
      join auth.users u on lower(u.email) = lower(a.email)
     where u.id = auth.uid()
  );
$$;

-- Per-shop program settings, so no number is baked into a workflow.
alter table public.shops add column if not exists stamps_at_join   int not null default 2;
alter table public.shops add column if not exists destination_tier text not null default 'domestic';
alter table public.shops add column if not exists city             text;
alter table public.shops add column if not exists state            text;
alter table public.shops add column if not exists zip              text;
alter table public.shops add column if not exists phone            text;
alter table public.shops add column if not exists onboarded_at     timestamptz;
alter table public.shops add column if not exists onboarded_by     uuid;

create or replace function public.onboard_shop(p_shop jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug    text;
  v_name    text;
  v_mile    int;
  v_start   int;
  v_staff   jsonb;
  v_owners  jsonb;
  v_row     jsonb;
  v_email   text;
  v_staff_n int := 0;
  v_inv_n   int := 0;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'auth_required');
  end if;
  if not public.is_platform_admin() then
    return jsonb_build_object('ok', false, 'error', 'not_admin');
  end if;

  v_name := btrim(coalesce(p_shop->>'name', ''));
  if length(v_name) < 2 then
    return jsonb_build_object('ok', false, 'error', 'bad_name');
  end if;

  v_slug := lower(btrim(coalesce(nullif(p_shop->>'slug', ''), v_name)));
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := btrim(v_slug, '-');
  if length(v_slug) < 2 then
    return jsonb_build_object('ok', false, 'error', 'bad_slug');
  end if;
  if exists (select 1 from public.shops where id = v_slug) then
    return jsonb_build_object('ok', false, 'error', 'slug_taken', 'slug', v_slug);
  end if;
  if coalesce(p_shop->>'business_type', '') = '' then
    return jsonb_build_object('ok', false, 'error', 'bad_type');
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
     coalesce(nullif(btrim(p_shop->>'industry'), ''), p_shop->>'business_type'),
     p_shop->>'business_type',
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
     now(), auth.uid());

  v_staff := coalesce(p_shop->'staff', '[]'::jsonb);
  for v_row in select value from jsonb_array_elements(v_staff) loop
    if length(btrim(coalesce(v_row->>'name', ''))) > 0 then
      insert into public.staff (shop_id, name, role, active)
      values (v_slug, btrim(v_row->>'name'),
              coalesce(nullif(btrim(coalesce(v_row->>'role', '')), ''), 'staff'), true);
      v_staff_n := v_staff_n + 1;
    end if;
  end loop;

  v_owners := coalesce(p_shop->'owners', '[]'::jsonb);
  for v_email in select lower(btrim(t.v)) from jsonb_array_elements_text(v_owners) as t(v) loop
    if position('@' in v_email) > 1 then
      insert into public.shop_invites (email, shop_id, role)
      select v_email, v_slug, 'owner'
       where not exists (
         select 1 from public.shop_invites i
          where i.shop_id = v_slug and lower(i.email) = v_email);
      v_inv_n := v_inv_n + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'shop_id', v_slug,
    'name', v_name,
    'join_url', 'https://join.retainos.co/' || v_slug,
    'staff', v_staff_n,
    'invited', v_inv_n,
    'milestone', v_mile,
    'stamps_at_join', v_start);
end;
$$;

revoke all on function public.onboard_shop(jsonb) from public;
revoke all on function public.onboard_shop(jsonb) from anon;
grant execute on function public.onboard_shop(jsonb) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
