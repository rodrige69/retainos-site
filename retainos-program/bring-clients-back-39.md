# Bring Clients Back · $39 (Package 1 "Regulars")

Working spec assembled from **RetainOS Packages Blueprint v2** (Oct 29, 2026), the packaging/pricing doc,
the strategic re-evaluation doc, `verticals.py`, and the Votel workflow audit (Oct 30, 2026).
Where the documents disagree, the disagreement is stated instead of resolved.

---

## 1. What the $39 buys

| Item | Detail |
|---|---|
| Price | $39/mo founder pricing |
| Where it lives | Shared RetainOS Votel account; each shop separated by tag + assigned-contacts role |
| Card | Wallet-style stamp card, joined by QR, no app |
| Reward | $100 Hotel Savings Card at the milestone, sent from RetainOS ("compliments of") |
| Starting balance | 2 stamps at join |
| Texts | 100/mo from the RetainOS number; extra packs +100 |
| Referrals | Both sides rewarded (see §3) |
| Languages | English and Spanish, every screen and message |
| Booking | Client keeps their existing booking app; RetainOS only overlays |
| Setup | $99 one-time, waived for pilot businesses |
| Not included | Custom branding, own number, deposit locks, missed-call text-back, idle-slot promos, shop insights (locked/blurred as the Full Book upsell) |

## 2. Reward economics (confirmed by the owner, Nov 7, 2026)

| Reward | Our cost | Limits |
|---|---|---|
| Hotel Savings Card | **$0** | none |
| Vacation getaway | **$0** | none — the guest pays taxes, fees, resort fees and the meal plan at all-inclusive properties |
| Dining voucher | **$4 / $6 / $9.50** for $35 / $50 / $100 face | the only reward that costs money |

That table is the margin story of the $39 plan: the headline reward — the hotel card — genuinely costs
nothing per issuance, so there is no per-card budget to police. Getaways are free to us for the same
structural reason (unsold inventory, guest pays the charges), which is why they can be offered at
volume rather than rationed.

Three consequences worth writing down:

1. **Dining is the only reward that needs funding.** Best practice from the supplier call: the shop
   funds it with a prepaid card carrying the voucher amount, so the cost never lands on RetainOS.
2. **$35 is not an amount the dining API accepts.** The allowed values are 25, 50, 100, 200 — the
   $35 tier exists on the price sheet but cannot be sent through this endpoint.
3. **Getaways are tiered by destination.** Basic plan: US destinations (Orlando and similar).
   Higher tiers: international (Cancún, Dominican Republic).

## 3. Rules (Blueprint v2, §3)

1. Join = 2 stamps.
2. Milestone = $100 Hotel Savings Card.
3. A product purchase counts as a visit in Package 1.
4. Referral: the friend gets a card after **their first paid visit**; the referrer earns 1 point.
5. 3 referral points = $300 card. 10 referrals = getaway (East Coast, 100+ miles from the customer's ZIP).
6. Referral dedupe against the master ledger by phone, then email. No reward if they are already a member anywhere.
7. Never say "free" or "gratis". Never name the rewards supplier. No rewards for reviews. No ™ on coined terms.
8. 7-day stamp lock: a second stamp inside 7 days raises an alert.

## 3b. How a reward is actually delivered

Three server-side POSTs against `https://members.marketingboost.com`, one shared key.

| Reward | Endpoint | Fields |
|---|---|---|
| Hotel card | `/api/hotel_saving_api/send` | `sender` (15900-17584), `business` (20404), `full_name`, `email`, `amount` ∈ 100/200/300/500, optional `message` |
| Vacation | `/api/vacation-incentives/send` | `sender`, `business`, `destination` (ID), `name`, `email`, optional `countrycode`, `phone`, `message` |
| Dining | `/api/restaurants_api/send` | `sender`, `business`, `full_name`, `email`, `amount` ∈ 25/50/100/200, optional `message` |

- Destination IDs come from `GET /api/all-destination-list/15900`. They are numeric, and the US vs
  international split must be **read from that list**, not hard-coded, so the tiering stays data.
- A success response is `{"status": true, "message": "..."}`. Treat anything else as a failed
  delivery: the workflow must not mark the reward issued, and must alert the owner instead.
- **The key is private and server-side only.** These calls belong in a Votel HTTP step or a Supabase
  Edge Function. Never in the claim page or any browser code — a key in page source is a key anyone
  can spend against the account.
- The fixed identifiers (`sender`, `business`) and the key belong in the workflow's secret store.
  They must never be written into a workflow step's visible config, a repo file, or a page.

## 4. Onboarding sheet — visits per card, by business type

The card length is set **per shop** at onboarding, from the business type. Cadence comes from
`verticals.py`; the number of stamps is the proposed design, not something the current build does
(today every shop is hard-coded to 5).

Design rule: `stamps × cadence ≈ 7–14 weeks` to a card. Long-cadence businesses get a shorter card
so the reward is reachable inside a season, not a year.

| Business type | Step-2 question (EN) | Pregunta (ES) | Cadence | Stamps at join | Stamps to card | Visits needed | Time to card |
|---|---|---|---|---|---|---|---|
| Barbershop | Who's your barber? | ¿Quién es tu barbero? | 2–4 wk | 2 | 5 | 3 | ~9 wk |
| Nails / Lash | Who does your nails / lashes? | ¿Quién hace tus uñas / pestañas? | 2–3 wk | 2 | 5 | 3 | ~8 wk |
| Brows / Waxing / Facials | Who does your brows? | ¿Quién hace tus cejas? | 3–5 wk | 1 | 4 | 3 | ~12 wk |
| Hair salon (color) | Who's your stylist? | ¿Quién es tu estilista? | 6–8 wk | 1 | 3 | 2 | ~14 wk |
| Braiding / natural hair | Who does your braids? | ¿Quién hace tus trenzas? | 6–8 wk | 1 | 3 | 2 | ~14 wk |
| Day spa / massage | Who's your therapist? | ¿Quién es tu terapeuta? | 4 wk | 1 | 4 | 3 | ~12 wk |
| Pet grooming | Who grooms your pet? | ¿Quién baña a tu mascota? | 6–8 wk | 1 | 3 | 2 | ~14 wk |
| Tattoo / piercing | Who's your artist? | ¿Quién es tu artista? | per project | 1 | 3 | 2 | — |
| Auto detailing | — | — | 8–12 wk | 1 | 3 | 2 | ~30 wk (consider product visits) |

Sheet columns to keep in the ledger's **Business types** tab, one row per shop at onboarding:

```
shop_id | business_type | cadence_weeks | stamps_at_join | stamps_to_card | reward_code | texts_included | language_default
```

Everything the workflows need then comes from that row — no number is baked into a workflow.

## 5. The step-by-step automation

Stages, in the order a client experiences them. Every stage names its trigger and where it lives.

**Stage 0 — Onboarding (owner, once)**
1. Shop onboarding form → writes the shop row (business type, cadence, stamps, language, texts).
2. Generates the shop's join page and QR (`join.retainos.co/<shop>`).
3. Creates the staff records and PINs, one per chair.
4. Sends the owner a one-page "how this works" in their language.

**Stage 1 — Join**
5. QR → join page → form (name, mobile, consent, email, staff, rewards channel, ZIP).
6. Create member with `stamps = stamps_at_join` from their shop row.
7. Welcome email: card link, personal invite link, how-it-works video.
8. If `?ref=` present → record referred-by, tag `ros-referred`, do **not** reward yet.

**Stage 2 — Every visit**
9. Staff portal → PIN → find member by phone → pick visit type → add stamp.
10. Guard: if last stamp < 7 days, alert and stop. Undo window 5 minutes.
11. Write the visit (staff, timestamp, type) to the visits log.
12. Send a progress message only when it matters (see below), never every visit.

**Stage 3 — Due back (the cadence engine)**
13. At `last_visit + cadence` → nudge with the booking link.
14. +3 days → second nudge. +7 days → third and final.
15. At `last_visit + 2 × cadence` → win-back message.

**Stage 4 — Milestone**
16. On the stamp that reaches `stamps_to_card` → issue the reward: code, expiry, reason.
17. Email/text the claim code + claim page link.
18. Claim page → name + email → webhook → mark claimed (atomic, single use).

**Stage 5 — Birthday**
19. Ask for the birthday after the 2nd visit, once only, never at join.
20. Send the greeting on the day, with the booking link.

**Stage 6 — Referrals**
21. After the 3rd visit → send the invite link + QR.
22. Friend joins with `?ref=` → both tagged, no reward yet.
23. Friend's first **paid** visit → friend gets a card; referrer +1 point.
24. 3 points → $300 card. 10 referrals → getaway certificate.
25. Dedupe by phone, then email, against every member on the platform.

**Stage 7 — Compliance and hygiene**
26. One STOP on the shared number stops texts from every shop — fall back to email.
27. Log every issuance, claim and referral point in the ledger.
28. Monthly: cards issued vs claimed vs expired, cost per card, texts used.

## 6. Before this can be switched on

- [x] Real per-card cost confirmed (§2): hotel cards $0, getaways $0, dining paid.
- [ ] Dining: who funds the $4–$9.50 — the shop's prepaid card, or absorbed?
- [ ] Domestic destination IDs pulled from the destination list, for the basic tier.
- [ ] Card length per business type approved (§4).
- [ ] Getaways: included at 10 referrals, or a +$39 add-on — one answer.
- [ ] 10DLC brand + campaign approved (SMS cannot send until then).
- [ ] Decide the single source of truth: Votel contacts + Sheets, or Supabase. Right now the join
      workflow writes to Votel and Sheets, and nothing writes to Supabase, so the app dashboard
      shows only test data.
