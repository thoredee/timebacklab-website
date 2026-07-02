# Spec — Paid report access (Stripe checkout + magic-link unlock)

**Status: TO BUILD (future phase).** This is the payment/access *gate* that sits in front of the
report generator. It does **not** build the report generator itself (matching a submission to
`report_nodes` and rendering the personalised report) — that remains a separate later phase (see
[`report-content-admin-spec.md`](report-content-admin-spec.md) and CLAUDE.md Next Steps).

## Goal
Let a quiz-taker pay a fixed fee by card, have the money land in the owner's bank, and on successful
payment unlock access to their personalised detailed report — **without building user accounts**.
Access is via a private, unguessable "magic link" tied to their existing `submission_id`.

## Decisions locked in (2026-07-02)
- **Provider: Stripe.** Owner is the merchant of record; payouts go to the owner's bank. Owner
  handles VAT/tax themselves (Stripe Tax can be added later if needed). Chosen over a
  merchant-of-record (Paddle / Lemon Squeezy) for lowest fees and flexibility; revisit only if VAT
  admin becomes painful.
- **Amex: supported by default** — no separate Amex merchant account needed (a Stripe advantage).
- **Global cards accepted.** A standard UK Stripe account takes cards from customers worldwide (US,
  India, etc.) with no special setup; money settles to the owner's GBP bank account. International
  cards cost more (~3.25% + 20p plus ~2% currency conversion — verify against Stripe's live
  pricing). **India caveat:** one-off card payments generally work, but many Indian cards are
  disabled for international online use by default under RBI rules, so expect a higher decline rate
  from Indian buyers — nothing fixable on our side (their bank), and it doesn't break anything here.
- **Pricing: one £ price + Stripe Adaptive Pricing (local-currency display).** The owner sets a
  single GBP price and *receives* GBP; Stripe's **Adaptive Pricing** auto-detects the buyer's
  country and *displays* the converted amount in their local currency at checkout (e.g. USD, INR) so
  it feels native. We are **not** doing true per-country/purchasing-power pricing (different actual
  amounts per country) for v1 — that needs self-maintained price tiers + geo logic and is gameable
  by VPN; noted as a possible later option only if there's a deliberate market strategy.
- **No accounts for now.** Buyers get a magic-link to their report, not a login. The data stays
  account-ready (everything is keyed to email + `submission_id`) so accounts can be added later
  with no re-architecture, once there is a second reason to log in (repeat purchases, group reports,
  subscriptions). "Customer account management" stays a placeholder in the admin menu.
- **Report output format: still to be decided** (on-site HTML page vs downloadable PDF/doc). The
  payment gate does not depend on this; it only needs to unlock *something* keyed to the token.

## How it works (flow)
1. Customer completes the quiz — already stored in D1 (`submissions`, unique `submission_id`).
2. On the results screen they click **"Order your report"** → sent to a **Stripe-hosted checkout**
   for the fixed fee, with the `submission_id` carried through (Checkout Session metadata /
   client_reference_id).
3. They pay by card (Visa/Mastercard/Amex). Money goes to Stripe → paid out to the owner's bank.
4. Stripe sends a **`checkout.session.completed` webhook** to the Worker.
5. The Worker **verifies the Stripe signature**, looks up the `submission_id`, marks it **paid**,
   and generates a unique **`report_token`** (unguessable random string).
6. Customer is redirected to a **"Thanks — here's your report" success page** carrying the token
   (and/or the token is emailed to them). The report page only renders when the token matches a
   paid row.

## Data model (extend existing `submissions` table)
Small additive schema change — **no new table**, no rework of existing columns:

```sql
ALTER TABLE submissions ADD COLUMN paid          INTEGER DEFAULT 0;   -- 0 | 1
ALTER TABLE submissions ADD COLUMN paid_at       TEXT;                -- ISO timestamp
ALTER TABLE submissions ADD COLUMN stripe_session TEXT;               -- Checkout Session id (idempotency / audit)
ALTER TABLE submissions ADD COLUMN amount_paid   INTEGER;             -- minor units (pence), audit
ALTER TABLE submissions ADD COLUMN currency      TEXT;                -- e.g. 'gbp'
ALTER TABLE submissions ADD COLUMN report_token  TEXT;                -- unguessable magic-link token
```
(Pasted by hand into the D1 dashboard Console — same manual step as every schema change here, no
`wrangler` on this ARM64 machine.)

## API (extend the existing Worker, route in `src/index.js`)
- **`POST /api/checkout`** — public. Body `{ submissionId }`. Creates a Stripe Checkout Session
  (fixed price, `client_reference_id = submissionId`, success/cancel URLs), returns the session URL
  for the browser to redirect to. Rejects unknown `submissionId`.
- **`POST /api/stripe-webhook`** — public but **signature-verified** (Stripe signing secret). On
  `checkout.session.completed`: set `paid=1`, `paid_at`, `stripe_session`, `amount_paid`,
  `currency`, and a freshly generated `report_token` on the matching row. **Idempotent** (ignore
  duplicate deliveries; Stripe retries). Never trust payment state from the browser — only from the
  verified webhook.
- **`GET /api/report?token=...`** — public. Returns the report (or its data) only if the token
  matches a `paid=1` row. This is the magic-link gate. (Exact response shape depends on the
  still-to-be-decided report output format.)

Secrets live as Worker secrets (Cloudflare dashboard → Settings → Variables and Secrets → Encrypt),
never in the repo — same pattern as `ADMIN_PASSWORD`:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Admin visibility
Surface paid status in `admin.html`'s submissions view (a **Paid** column + `paid_at` in the detail
modal) so the owner can see who has purchased. No new admin area needed for v1.

## Site changes
- Wire the results-screen **"Order your report"** button (currently a placeholder `#` link) to the
  checkout flow.
- Add a **payment success page** ("Thanks — access your report") that reads the token.
- Add a **cancel/return** path back to the results screen.

## Build order (when this phase starts)
1. Owner creates a Stripe account (business details + bank for payouts), sets the price, and pastes
   the two Stripe secrets into the Cloudflare dashboard.
2. Paste the `ALTER TABLE` statements into the D1 Console.
3. Add `src/api/checkout.js` + `src/api/stripe-webhook.js` + `src/api/report.js`, route in
   `src/index.js`.
4. Wire the "Order your report" button, success page, cancel path.
5. Add the Paid column/field to `admin.html`.
6. Test end-to-end with Stripe **test mode** cards before going live.
7. Commit, push, verify live; switch Stripe to live mode.

## Owner (Thore) to-do
- Decide the **report price** (a single **£** amount — Stripe shows it in local currency automatically).
- **Create the Stripe account** and complete verification/bank details (guided step-by-step).
- **Turn on Adaptive Pricing** in the Stripe dashboard (local-currency display) — a toggle, guided.
- Paste **two Stripe secrets** into the Cloudflare dashboard (one at a time, guided).
- Paste the **`ALTER TABLE` SQL** into the D1 Console.
- Later: decide the **report output format** (drives the report-generator phase, not this gate).

## Out of scope (separate phases)
- **The report generator itself** — matching a paid submission to `report_nodes` and rendering the
  personalised report. This spec only unlocks access; the generator is the next major design phase.
- **True per-country / purchasing-power pricing** — charging different actual amounts per country
  (as opposed to the one-£-price + local-currency *display* we are doing). Would need self-maintained
  price tiers + geo logic; only if a deliberate market strategy calls for it later.
- **User accounts / login** — deliberately deferred; data is kept account-ready.
- **Refunds/disputes handling, receipts/invoicing, VAT accounting** — handled in the Stripe
  dashboard for v1; automate later if volume warrants.
