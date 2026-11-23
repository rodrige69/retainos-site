-- 010_push_pilot.sql — opt-in Web Push (Phase 2 pilot). TEST PROJECT FIRST.
-- Decisions (Danny, Nov 23 2026): push is sent IN ADDITION to email; events =
-- stamp added, reward earned, due-back reminder (due date + one follow-up 7 days
-- later), shop announcements. Only clients who tapped "turn on" get pushes.
-- Tables have RLS on and NO policies: nothing is readable with the public key;
-- all access goes through the functions below.

create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  shop_id     text not null references public.shops(id) on delete cascade,
  member_id   uuid not null references public.members(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  consent_at  timestamptz not null default now(),
  revoked_at  timestamptz,
  last_sent_at timestamptz,
  fail_count  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists push_subs_member on public.push_subscriptions (member_id) where revoked_at is null;
alter table public.push_subscriptions enable row level security;

-- One row per message actually sent: stops duplicates (e.g. a reminder twice).
create table if not exists public.push_log (
  id        bigint generated always as identity primary key,
  member_id uuid not null references public.members(id) on delete cascade,
  kind      text not null,
  ref       text not null,
  sent_at   timestamptz not null default now(),
  unique (member_id, kind, ref)
);
alter table public.push_log enable row level security;

create or replace function public._push_secret_ok(p_secret text) returns boolean
language sql stable security definer set search_path to 'public' as $$
  select coalesce((select value = p_secret from public.app_secrets where name = 'push_send'), false);
$$;
revoke all on function public._push_secret_ok(text) from public, anon, authenticated;

-- Client turns notifications on (called from their card; the card token is the credential).
create or replace function public.save_push_subscription(p_token uuid, p_endpoint text, p_p256dh text, p_auth text, p_ua text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_m public.members;
begin
  select * into v_m from public.members where card_token = p_token;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_card'); end if;
  if coalesce(p_endpoint, '') !~ '^https://' or length(p_endpoint) > 1000
     or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    return jsonb_build_object('ok', false, 'error', 'bad_subscription');
  end if;
  insert into public.push_subscriptions (shop_id, member_id, endpoint, p256dh, auth, user_agent)
  values (v_m.shop_id, v_m.id, p_endpoint, p_p256dh, p_auth, left(p_ua, 300))
  on conflict (endpoint) do update set shop_id = excluded.shop_id, member_id = excluded.member_id,
    p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent,
    consent_at = now(), revoked_at = null, fail_count = 0;
  return jsonb_build_object('ok', true);
end $$;

-- Client turns notifications off.
create or replace function public.remove_push_subscription(p_token uuid, p_endpoint text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
begin
  update public.push_subscriptions s set revoked_at = now()
    from public.members m
   where m.card_token = p_token and s.member_id = m.id and s.endpoint = p_endpoint and s.revoked_at is null;
  return jsonb_build_object('ok', true);
end $$;

-- Server only (secret required): where to send for one client, plus the shop name for the title.
create or replace function public.get_push_targets(p_secret text, p_member uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._push_secret_ok(p_secret) then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  return jsonb_build_object('ok', true, 'targets', coalesce((
    select jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth,
             'shop', sh.name, 'shop_id', sh.id, 'card_url',
             'https://app.retainos.co/join.html?shop=' || m.shop_id || '&t=' || m.card_token, 'language', m.language))
      from public.push_subscriptions s
      join public.members m on m.id = s.member_id
      join public.shops sh on sh.id = s.shop_id
     where s.member_id = p_member and s.revoked_at is null), '[]'::jsonb));
end $$;

-- Server only: claim a message before sending. Returns false if already sent (dedupe).
create or replace function public.claim_push(p_secret text, p_member uuid, p_kind text, p_ref text)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v_n int;
begin
  if not public._push_secret_ok(p_secret) then return false; end if;
  insert into public.push_log (member_id, kind, ref) values (p_member, p_kind, p_ref) on conflict do nothing;
  get diagnostics v_n = row_count;
  return v_n = 1;
end $$;

-- Server only: record a delivery result; dead subscriptions (404/410) are revoked.
create or replace function public.mark_push_result(p_secret text, p_endpoint text, p_ok boolean, p_gone boolean)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public._push_secret_ok(p_secret) then return; end if;
  update public.push_subscriptions set
    last_sent_at = case when p_ok then now() else last_sent_at end,
    fail_count   = case when p_ok then 0 else fail_count + 1 end,
    revoked_at   = case when p_gone or (not p_ok and fail_count + 1 >= 5) then now() else revoked_at end
   where endpoint = p_endpoint;
end $$;

-- Server only: who is due a reminder today (opted in, not opted out of texts,
-- due date or due date + 7 days, not already reminded for this visit).
create or replace function public.get_push_reminders(p_secret text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._push_secret_ok(p_secret) then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  return jsonb_build_object('ok', true, 'due', coalesce((
    select jsonb_agg(jsonb_build_object('member_id', d.member_id, 'first_name', d.first_name,
             'stage', case when d.days_out >= d.rebook_days + 7 then 'followup' else 'due' end,
             'ref', to_char(d.last_visit_at, 'YYYY-MM-DD') || ':' ||
                    case when d.days_out >= d.rebook_days + 7 then 'followup' else 'due' end))
      from public.v_due_back d
     where d.is_due
       and (d.days_out between d.rebook_days and d.rebook_days + 2
            or d.days_out between d.rebook_days + 7 and d.rebook_days + 9)
       and exists (select 1 from public.push_subscriptions s where s.member_id = d.member_id and s.revoked_at is null)
       and not exists (select 1 from public.push_log l where l.member_id = d.member_id and l.kind = 'reminder'
                        and l.ref = to_char(d.last_visit_at, 'YYYY-MM-DD') || ':' ||
                                    case when d.days_out >= d.rebook_days + 7 then 'followup' else 'due' end)), '[]'::jsonb));
end $$;

revoke all on function public.save_push_subscription(uuid,text,text,text,text) from public;
grant execute on function public.save_push_subscription(uuid,text,text,text,text) to anon, authenticated;
revoke all on function public.remove_push_subscription(uuid,text) from public;
grant execute on function public.remove_push_subscription(uuid,text) to anon, authenticated;
revoke all on function public.get_push_targets(text,uuid) from public;
grant execute on function public.get_push_targets(text,uuid) to anon;
revoke all on function public.claim_push(text,uuid,text,text) from public;
grant execute on function public.claim_push(text,uuid,text,text) to anon;
revoke all on function public.mark_push_result(text,text,boolean,boolean) from public;
grant execute on function public.mark_push_result(text,text,boolean,boolean) to anon;
revoke all on function public.get_push_reminders(text) from public;
grant execute on function public.get_push_reminders(text) to anon;
