# Brief for an AI agent working on RetainOS ↔ Votel

Hand this file to the agent. It says what exists, where it lives, and what it
must not do. Everything here was read from the running code and database, not
guessed.

## The three surfaces, and which one does what

| Surface | URL | What it is for |
|---|---|---|
| RetainOS app | `https://app.retainos.co` | Staff and owners work here: dashboard, join link, QR poster, reward claims, announcement. Nothing is configured here. |
| Vercel | project `retainos-app` → Settings → Environment Variables | Server secrets for the app (`VOTEL_API_KEY`, `VOTEL_API_TOKEN`). Changing one needs a Redeploy. |
| Votel | dashboard → Automations / Workflows | Where a workflow calls RetainOS with an HTTP step. |

An owner logging into `app.retainos.co` cannot set secrets or call the API from
there. If a task is "set up the token", it happens in Vercel, not in the app.

## Two different secrets — do not mix them up

- `VOTEL_API_KEY` — issued **by Votel**. Used by RetainOS to *send* email
  through Votel (signup email). Already configured.
- `VOTEL_API_TOKEN` — invented **by the account owner**, any long random string.
  Used by RetainOS to *accept* calls from a Votel workflow. Until it is set in
  Vercel (Production) and redeployed, the three endpoints below answer
  `501 {"ok":false,"error":"not_configured"}`.

The same invented string is put in the Votel workflow's HTTP step as
`Authorization: Bearer <string>`. It never belongs in front-end code, a git
commit, or a chat message.

## Endpoints RetainOS exposes to Votel

Base: `https://app.retainos.co`. All are `POST`, `Content-Type: application/json`,
and require `Authorization: Bearer <VOTEL_API_TOKEN>`. Wrong or missing header →
`401 {"ok":false,"error":"unauthorized"}`. Wrong method → `405`.

### `POST /api/votel/card`

Read one client's stamp card.

```json
{ "token": "fb24a0cb-ae80-4124-974f-9733eeaca8c3" }
```

`token` is the card token from the join link (`join.html?shop=<shop>&t=<token>`);
it must be a UUID or the answer is `400 {"ok":false,"error":"bad_token"}`.

Answer:

```json
{ "ok": true, "first_name": "Lisa", "shop": "Fade Lab Barbershop",
  "stamps": 2, "milestone": 5, "visits": 4, "earned": 1,
  "reward": "Hotel Savings Card - $100", "last_visit": "2026-11-07T…",
  "language": "en" }
```

### `POST /api/votel/member`

Put a client on a shop's card. Idempotent per phone number.

```json
{ "shop": "fade-lab", "phone": "3055551212",
  "consent": "I agree to receive texts from Fade Lab Barbershop.",
  "first": "Lisa", "last": "Rookstool", "email": "lisa@example.com", "language": "en" }
```

`consent` is the exact wording the client agreed to and is stored with a
timestamp. It is required — `400 {"ok":false,"error":"consent_required"}`
otherwise. Missing shop or phone → `{"error":"shop_phone_required"}`.

Answer matches `join_shop`: `{ok, returning, token, stamps, milestone,
first_name, last_name, shop, reward, card_url}`. When `returning` is `true` the
person was already on the card and nothing was duplicated.

### `POST /api/votel/visit`

Log one visit and add a stamp.

```json
{ "shop": "fade-lab", "phone": "3055551212", "pin": "1234", "visit_type": "appointment" }
```

`pin` is a 4-digit staff PIN at that shop — the same code the counter pad uses.
PINs are stored hashed; there is no way to look one up, so it has to come from
the shop owner.

Answers come straight from `log_visit`:

- `{"ok":true,"member":"Lisa","staff":"Julio","visits":5,"cycle":0,"milestone":5,"reward":"hotel_100","reward_name":"Hotel Savings Card - $100","reward_id":"…"}`
- `{"ok":false,"error":"too_soon","last_visit":"…","days_left":3}` — one stamp per 7 days
- `{"ok":false,"error":"not_member"}` — run `/member` first
- `{"ok":false,"error":"bad_pin"}` / `{"ok":false,"error":"unknown_shop"}`

When a visit completes the card, `cycle` resets to 0 and a voucher is issued.
The message the workflow sends should link to
`https://app.retainos.co/claim?code=<voucher_code>`.

## What the agent must not do

- Never ask for, print, store or commit `SUPABASE_SERVICE_ROLE_KEY`, the Votel
  key, or `VOTEL_API_TOKEN`. The owner pastes the token into Vercel and Votel
  themselves.
- Never write to Supabase directly. Every change goes through the endpoints
  above or the app's pages, so row-level security keeps deciding.
- Never send SMS. No 10DLC brand/campaign and no toll-free verification exist
  yet, so texts will not deliver on this account. Email works.
- Never invent prices, plan contents or results. Plans are `regulars` (Come
  Back, $39), `full_book` (Booked Solid, $79), `hands_off` (Day Off, $149) —
  those keys are internal and unchanged.

## Shops that exist

`fade-lab`, `julio-fades`, `julio-fades-2`, `braiding-lab`, `hialeah-barber`,
`boca-raton-salon`, `trump-doral-spa`. A shop collects clients only while its
`status` is `active`; `/admin` is where that is flipped after an invoice clears.

## Useful links

- Join a shop: `https://app.retainos.co/join.html?shop=<shop>`
- Client's card: `https://app.retainos.co/join.html?shop=<shop>&t=<token>`
- Reward claim: `https://app.retainos.co/claim?code=<voucher_code>`
