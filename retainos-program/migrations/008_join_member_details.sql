-- 008_join_member_details.sql
-- Clients joined with a phone number alone, so the shop had nothing but a
-- number to reach them by and nothing to call them. The join form now captures
-- first name, last name, email and the exact consent wording, and join_shop
-- returns a card link (join.html?shop=<shop>&t=<token>) that opens the card on
-- any phone, which replaces "save this page to your home screen".
--
-- join_shop keeps its first four parameters in the same order so any positional
-- caller still lines up; the new ones are appended with defaults. Dropping the
-- old signature drops its grants, so they are re-issued for anon and authenticated.

alter table public.members add column if not exists last_name text;

drop function if exists public.join_shop(text, text, text, text);

create function public.join_shop(
  p_shop text,
  p_phone text,
  p_language text default 'en'::text,
  p_consent text default null::text,
  p_first text default null::text,
  p_last text default null::text,
  p_email text default null::text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_digits text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
  v_email  text := nullif(btrim(lower(coalesce(p_email, ''))), '');
  v_member public.members;
  v_shop   public.shops;
  v_reward public.rewards;
  v_stamp  int;
  v_url    text;
begin
  select * into v_shop from public.shops where id = p_shop and status = 'active';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_shop');
  end if;
  if length(v_digits) < 10 then
    return jsonb_build_object('ok', false, 'error', 'bad_phone');
  end if;
  if v_email is not null and (position('@' in v_email) = 0 or position('.' in v_email) = 0) then
    return jsonb_build_object('ok', false, 'error', 'bad_email');
  end if;
  if coalesce(btrim(p_consent), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'no_consent');
  end if;

  select * into v_member from public.members
   where shop_id = p_shop and regexp_replace(phone, '\D', '', 'g') = v_digits;
  if found then
    -- A returning client fills in whatever is still blank, never overwrites.
    update public.members
       set first_name = coalesce(nullif(first_name, ''), nullif(btrim(coalesce(p_first, '')), '')),
           last_name  = coalesce(nullif(last_name, ''),  nullif(btrim(coalesce(p_last, '')), '')),
           email      = coalesce(nullif(email, ''), v_email)
     where id = v_member.id
     returning * into v_member;
    return jsonb_build_object('ok', true, 'returning', true,
      'token', v_member.card_token, 'stamps', v_member.cycle_visits,
      'milestone', v_shop.milestone, 'first_name', v_member.first_name,
      'last_name', v_member.last_name, 'shop', v_shop.name,
      'card_url', 'https://app.retainos.co/join.html?shop=' || p_shop || '&t=' || v_member.card_token);
  end if;

  v_stamp := least(greatest(coalesce(v_shop.stamps_at_join, 0), 0),
                   greatest(coalesce(v_shop.milestone, 1) - 1, 0));

  insert into public.members
    (shop_id, phone, email, first_name, last_name, language,
     sms_consent_at, sms_consent_text, joined_at, cycle_visits)
  values
    (p_shop, v_digits, v_email,
     nullif(btrim(coalesce(p_first, '')), ''), nullif(btrim(coalesce(p_last, '')), ''),
     case when p_language = 'es' then 'es' else 'en' end,
     now(), p_consent, now(), v_stamp)
  returning * into v_member;

  select * into v_reward from public.rewards
   where plan_required = 'regulars' and kind = 'hotel_card'
   order by amount_usd nulls last limit 1;

  v_url := 'https://app.retainos.co/join.html?shop=' || p_shop || '&t=' || v_member.card_token;

  return jsonb_build_object('ok', true, 'returning', false,
    'token', v_member.card_token, 'stamps', v_member.cycle_visits,
    'milestone', v_shop.milestone,
    'first_name', v_member.first_name, 'last_name', v_member.last_name,
    'shop', v_shop.name, 'reward', v_reward.name, 'card_url', v_url);
end;
$$;

revoke all on function public.join_shop(text, text, text, text, text, text, text) from public;
grant execute on function public.join_shop(text, text, text, text, text, text, text) to anon, authenticated;
