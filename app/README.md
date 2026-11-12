# RetainOS app

Static pages on Vercel, data in Supabase. No build step.

## Routes

| URL | Who | What |
|---|---|---|
| `app.retainos.co/signin` | owner | email link or 6-digit code |
| `app.retainos.co/dashboard` | owner | live counts from `v_shop_dashboard` |
| `app.retainos.co/onboard` | owner | join link, QR, printable poster |
| `app.retainos.co/staff?shop=fade-lab` | staff | PIN + phone → `log_visit` |
| `app.retainos.co/start` | new owner | create account + shop in one step |
| `app.retainos.co/join.html?shop=fade-lab` | client | join (name, phone, email, consent) |
| `app.retainos.co/thankyou.html` | client | card link + save-to-home-screen steps |
| `app.retainos.co/join.html?shop=fade-lab&t=<token>` | client | the card itself, on any phone |
| `app.retainos.co/claim?code=<voucher>` | client | a reward: ready to use, already used, or expired |

`/claim` also accepts the code as `/claim/<code>`. Without a code it shows a
field to type one, which is what the "reply to this text" path needs.

The join page is the only public surface. Everything else under `app.` requires
a signed-in owner, except `/staff` (the 4-digit PIN is the credential) and
`/start`, where a new owner creates their account.

## Setup

1. `cp config.example.js config.js` and paste the **anon** key (Project Settings → API).
   The anon key is public; row-level security does the protecting. Never put
   `service_role` here.
2. Deploy `app/` as a Vercel project on `app.retainos.co`. The client-facing join
   page is `app.retainos.co/join.html?shop=<shop>`, so one deployment serves both.
3. Supabase → Authentication → URL Configuration: add
   `https://app.retainos.co` as a site URL and redirect URL.
4. Magic links need SMTP. Until a provider is connected in Project Settings → Auth,
   Supabase's built-in sender is rate-limited and often filtered — use the
   6-digit code form or email + password for the pilot.

## QRs

`qr/<shop>.svg` is generated from `https://app.retainos.co/join.html?shop=<shop>`
once per shop (`make-qr.py`). Printing a poster never changes the URL, so QRs
stay valid.

## Votel sync

Creating a shop also puts it into Votel as a contact, so every business has a
home there and its staff and clients hang under `ros-shop:<slug>`. The tags match
the shop-owner contacts that already exist:

| Tag | Meaning |
|---|---|
| `ros-shop-owner` | this contact is a shop, not a client |
| `ros-shop:<slug>` | which shop — everything for that shop groups under it |
| `ros-niche:<business_type>` | barbershop, hair_salon, braiding … |
| `ros-industry:<group>` | beauty, wellness |
| `ros-plan:<plan>` | the plan key on the shop row |

`POST /api/votel-shop` (`app/api/votel-shop.js`) does the work server-side: the
browser sends only the shop id and the owner's access token, the function checks
ownership through row-level security, then calls Votel's MCP `create_contact`
and records the id through `set_shop_votel_contact`.

Vercel → Settings → Environment Variables: add one,

- `VOTEL_API_KEY` — the Votel MCP token (server only, never in `config.js`)

The Supabase URL and anon key are public and already in `config.js`, so the
function reads them from there. `SUPABASE_URL` / `SUPABASE_ANON_KEY` override
them only if you ever need to point the function at a different project.

Without them the route answers 501 and the setup screen says the contact is
pending, so a Votel problem never costs a signup.

## Votel endpoints

Votel never gets a database key. Anything that can send an HTTP POST calls these
three with `Authorization: Bearer $VOTEL_API_TOKEN`:

| Endpoint | Body | Does |
|---|---|---|
| `POST /api/votel/visit` | `{shop, phone, pin, visit_type?}` | `log_visit` — adds one stamp, keeps the 7-day lock, issues the reward at the milestone |
| `POST /api/votel/card` | `{token}` | `get_card` — reads a stamp card by its token |
| `POST /api/votel/member` | `{shop, phone, consent, first?, last?, email?, language?}` | `join_shop` — puts a client on the card |
| `POST /api/votel/welcome` | `{token}` | emails the card link to the member's email. Browser-facing, so it takes the card token instead of `VOTEL_API_TOKEN` |

Add `VOTEL_API_TOKEN` in Vercel → Environment Variables (any long random string),
and use the same string in the Votel workflow's API step. Rotating it in Vercel
revokes every caller at once. Without it the endpoints answer 501.

`/api/votel/welcome` is called by the join page itself (not by Votel) right
after a client signs up, and sends through Votel from `support@retainos.co`.
It needs `VOTEL_API_KEY`, not `VOTEL_API_TOKEN`; `VOTEL_EMAIL_FROM` overrides
the sender. Without `VOTEL_API_KEY` it answers 503 and the client simply does
not get mail — the signup still succeeds.

### The milestone message

When a client reaches the card, `log_visit` returns the reward with its
`voucher_code`. The message Votel sends should link to

```
https://app.retainos.co/claim?code=<voucher_code>
```

Do not use `join.retainos.co/claim`: that host serves Votel's own page, which
knows nothing about a shop's rewards, so a client arriving from it has nothing
to show at the counter.

In Votel these map to the `api_lookup` (read) and `webhook` (write) workflow
steps. A visit needs a real staff PIN for that shop — the PIN, not the token, is
what authorises the stamp. Errors come back as HTTP 200 with
`{ok: false, error}` (`bad_pin`, `too_soon`, `not_member`, `unknown_shop`) so a
workflow can branch without parsing status codes.

## Announcement (`/promo`)

One owner-written message shown to clients on their card, on the reward claim
page, and on the thank-you page. Fields live on `shops.promo_*`; clients read
them through `get_shop_promo`, and the owner writes them through
`set_shop_promo`, which checks ownership against `shop_owners` inside the
database instead of trusting the page. Image and link must be `http(s)` URLs —
there is no upload yet, and `promo-widget.js` escapes every field, so an owner
cannot inject markup into a client page.

The dashboard links to it from the chip next to QR & links.

## Shops and payment (`/admin`)

A shop is created `pending` and only takes clients once it is `active` —
`join_shop` ignores any other status. `/admin` lists every shop with its plan
and status and calls `set_shop_status` to mark an invoice paid, pause a shop or
turn it back on. The admin check lives in the database (`is_platform_admin`),
so the page being reachable is cosmetic, not the gate. Self-serve signups
(`create_my_shop`) stay `pending` until someone marks them paid.

Booked Solid and Day Off shops keep their Votel sub-account id on
`shops.votel_subaccount_id`, pasted in during setup. Come Back shops have none:
they send from the main account and are grouped there by the `ros-shop:` tag.

## `/api/health`

Publicly it answers `{ok, commit}` and nothing else — enough to tell which
deployment is live. The inventory of configured settings (names only, never
values) requires `Authorization: Bearer <admin session>`, checked by calling
`is_platform_admin` with that token. `/admin` shows the same list to a signed-in
platform admin, so nobody has to read it out of a URL.

## Referral links

Every member carries an 8-character `referral_code`, generated on join and
backfilled for older rows. Their card shows
`…/join.html?shop=<shop>&ref=<code>`, and the card email carries the same link,
so the ask travels with the one message every client receives.

`join_shop` resolves the code inside that shop only, ignores unknown codes, and
never credits a member to themselves. A hit writes one row into `referrals`
(`referrer_id`, `friend_id`, `status = 'joined'`), which the dashboard reads
under the existing owner policy and shows as "brought by".

## Two rewards per card

A card is ten visits. `shop_milestones` holds the stops for a shop (5 and 10 by
default, seeded when the shop is created); `log_visit` pays a reward when the
cycle lands exactly on a stop and resets the card after the last one, so a
client gets something at five and something bigger at ten without ever holding
two half-finished cards.

What each plan hands out is decided by `plan_milestone_reward(plan, stop)`,
which follows what the rewards page sells:

| Plan | 5 visits | 10 visits |
|---|---|---|
| Come Back (`regulars`) | Hotel Savings Card - $100 | Hotel Savings Card - $500 |
| Booked Solid (`full_book`) | Dining Reward - $100 | Domestic Getaway |
| Day Off (`hands_off`) | Dining Reward - $100 | International Getaway |

Every plan includes hotel savings cards, so a Come Back shop still hands out
`hotel_100`/`hotel_500`. The `rewards.plan_required` column records which plan
a reward belongs to, but nothing filters by it at runtime: the stops come from
the shop's own `shop_milestones` rows. `get_shop_rewards(shop)` returns them with
names for the join page, and `join_shop` reports the first stop's reward for the
plan the shop is actually on.

## Share links from the dashboard

The dashboard has a "Send a link" card with two rows: the shop's booking link
and the owner's own payment link. Both have a Share button that opens the
phone's share sheet (`navigator.share`) and falls back to copying, so the owner
can send either link without leaving the page.

The payment link lives in `shop_settings`, one row per shop. Only the shop's
owner can reach it: `anon` has no grant on the table, `authenticated` has
select/insert/update, and the RLS policies check `shop_owners` against
`auth.uid()`. It never appears on the join, thank-you or claim pages.
`set_shop_payment(p_shop, p_link)` checks ownership and that the value looks
like an http(s) link, and an empty value clears it.

The booking link can be changed from the same card after setup
(`set_shop_booking`), which matters because shops switch booking tools. Both
link writers check ownership and only accept http(s), so the dashboard can't be
used to store something else there.

Pasted links are normalised rather than rejected: `booksy.com/yourshop` and
`//square.site/x` both become `https://…` in `set_shop_booking` and
`set_shop_payment`, and on the dashboard before the save is sent. Anything with
a non-http scheme, or with spaces, is still refused.
