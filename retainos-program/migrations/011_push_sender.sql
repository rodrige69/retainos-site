-- 011_push_sender.sql — lets the server send pushes. TEST PROJECT FIRST.
-- Secrets live in app_secrets (no policies, unreadable with the public key):
--   push_send          shared secret, same value as Vercel env PUSH_SEND_SECRET
--   push_vapid_public  / push_vapid_private / push_subject   (VAPID key pair)
--   push_endpoint      e.g. https://app.retainos.co/api/push/send
-- Until push_endpoint is set the visit trigger below does nothing at all.

create or replace function public.get_push_config(p_secret text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._push_secret_ok(p_secret) then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  return jsonb_build_object('ok', true,
    'public_key',  (select value from public.app_secrets where name = 'push_vapid_public'),
    'private_key', (select value from public.app_secrets where name = 'push_vapid_private'),
    'subject',     coalesce((select value from public.app_secrets where name = 'push_subject'), 'mailto:support@retainos.co'));
end $$;

-- Clients of one shop who turned push on (for announcements).
create or replace function public.get_push_shop_members(p_secret text, p_shop text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._push_secret_ok(p_secret) then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  return jsonb_build_object('ok', true, 'members', coalesce((
    select jsonb_agg(distinct s.member_id) from public.push_subscriptions s
     where s.shop_id = p_shop and s.revoked_at is null), '[]'::jsonb));
end $$;

-- After a visit is logged: tell the push sender (only if the client has push on).
-- Never blocks or undoes the visit: any problem is swallowed.
create or replace function public.trg_push_on_visit()
returns trigger language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare v_url text; v_secret text; v_kind text; v_ri record; v_body jsonb;
begin
  begin
    select value into v_url from public.app_secrets where name = 'push_endpoint';
    if v_url is null then return new; end if;
    if not exists (select 1 from public.push_subscriptions where member_id = new.id and revoked_at is null) then return new; end if;
    select value into v_secret from public.app_secrets where name = 'push_send';

    v_kind := case when coalesce(new.rewards_earned, 0) > coalesce(old.rewards_earned, 0) then 'reward' else 'stamp' end;
    v_body := jsonb_build_object('member_id', new.id, 'kind', v_kind,
                                 'ref', 'visit:' || new.lifetime_visits, 'stamps', new.cycle_visits);
    if v_kind = 'reward' then
      select ri.voucher_code, r.name into v_ri
        from public.rewards_issued ri join public.rewards r on r.code = ri.reward_code
       where ri.member_id = new.id order by ri.issued_at desc limit 1;
      v_body := v_body || jsonb_build_object('reward_name', v_ri.name,
                  'claim_url', 'https://app.retainos.co/claim?code=' || v_ri.voucher_code);
    end if;

    perform net.http_post(url := v_url, body := v_body,
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
      timeout_milliseconds := 3000);
  exception when others then
    raise warning 'trg_push_on_visit failed: %', sqlerrm;
  end;
  return new;
end $$;

drop trigger if exists trg_push_on_visit on public.members;
create trigger trg_push_on_visit after update of lifetime_visits on public.members
  for each row when (new.lifetime_visits > old.lifetime_visits) execute function public.trg_push_on_visit();

revoke all on function public.get_push_config(text) from public;
grant execute on function public.get_push_config(text) to anon;
revoke all on function public.get_push_shop_members(text,text) from public;
grant execute on function public.get_push_shop_members(text,text) to anon;
revoke all on function public.trg_push_on_visit() from public, anon, authenticated;
