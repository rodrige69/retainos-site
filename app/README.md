# RetainOS app

Static pages on Vercel, data in Supabase. No build step.

## Routes

| URL | Who | What |
|---|---|---|
| `app.retainos.co/signin` | owner | email link or 6-digit code |
| `app.retainos.co/dashboard` | owner | live counts from `v_shop_dashboard` |
| `app.retainos.co/onboard` | owner | join link, QR, printable poster |
| `app.retainos.co/staff?shop=fade-lab` | staff | PIN + phone → `log_visit` |
| `join.retainos.co/fade-lab` | client | join + stamp card |

`join.retainos.co/*` is the only public surface. Everything under `app.` requires
a signed-in owner, except `/staff`, where the 4-digit PIN is the credential.

## Setup

1. `cp config.example.js config.js` and paste the **anon** key (Project Settings → API).
   The anon key is public; row-level security does the protecting. Never put
   `service_role` here.
2. Deploy `app/` as a Vercel project with both domains attached
   (`app.retainos.co` and `join.retainos.co`). `index.html` routes by hostname.
3. Supabase → Authentication → URL Configuration: add
   `https://app.retainos.co` as a site URL and redirect URL.
4. Magic links need SMTP. Until a provider is connected in Project Settings → Auth,
   Supabase's built-in sender is rate-limited and often filtered — use the
   6-digit code form or email + password for the pilot.

## QRs

`qr/<shop>.svg` is generated from `https://join.retainos.co/<shop>` once per shop
(`make-qr.py`). Printing a poster never changes the URL, so QRs stay valid.
