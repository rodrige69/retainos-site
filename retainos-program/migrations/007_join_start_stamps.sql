-- 007_join_start_stamps.sql
-- join_shop promised "2 stamps at join" on the shop row and on the poster, but
-- wrote every new member at 0, so the first card always looked one visit behind.
-- The insert now seeds cycle_visits from shops.stamps_at_join (clamped so a card
-- can never be created already full), and the response reports that number.

create or replace function public.join_shop(p_shop text, p_phone text, p_language text default 'en'::text, p_consent text default null::text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_digits text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
  v_member public.members;
  v_shop   public.shops;
  v_reward public.rewards;
  v_stamp  int;
begin
  select * into v_shop from public.shops where id = p_shop and status = 'active';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_shop');
  end if;
  if length(v_digits) < 10 then
    return jsonb_build_object('ok', false, 'error', 'bad_phone');
  end if;
  if coalesce(btrim(p_consent), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'no_consent');
  end if;

  select * into v_member from public.members
   where shop_id = p_shop and regexp_replace(phone, '\D', '', 'g') = v_digits;
  if found then
    return jsonb_build_object('ok', true, 'returning', true,
      'token', v_member.card_token, 'stamps', v_member.cycle_visits,
      'milestone', v_shop.milestone, 'first_name', v_member.first_name,
      'shop', v_shop.name);
  end if;

  v_stamp := least(greatest(coalesce(v_shop.stamps_at_join, 0), 0),
                   greatest(coalesce(v_shop.milestone, 1) - 1, 0));

  insert into public.members
    (shop_id, phone, language, sms_consent_at, sms_consent_text, joined_at, cycle_visits)
  values
    (p_shop, v_digits, case when p_language = 'es' then 'es' else 'en' end,
     now(), p_consent, now(), v_stamp)
  returning * into v_member;

  select * into v_reward from public.rewards
   where plan_required = 'regulars' and kind = 'hotel_card'
   order by amount_usd nulls last limit 1;

  return jsonb_build_object('ok', true, 'returning', false,
    'token', v_member.card_token, 'stamps', v_member.cycle_visits,
    'milestone', v_shop.milestone,
    'first_name', v_member.first_name, 'shop', v_shop.name,
    'reward', v_reward.name);
end;
$$;
