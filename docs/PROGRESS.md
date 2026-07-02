# timebacklab Website — Progress

## Project Status
- [x] Repo created and cloned locally
- [x] Design handoff received (Claude Design export) and extracted to `_handoff/`
- [x] Homepage built from `Timeback Homepage.dc.html` (5 sections + nav + footer)
- [x] Source images compressed for web (48MB → ~1MB total)
- [x] Mobile responsive breakpoints added (980px tablet, 640px mobile)
- [x] Mobile hamburger nav menu added (not in original design, needed for small screens)
- [x] Local server verified — all assets resolve with 200
- [x] Quiz page built (10-question adaptive diagnostic with tier-based results)
- [x] Quiz intro page with email validation and opt-in form
- [x] Legal/compliance updates to quiz intro (marketing opt-in, consent text, email label clarification)
- [ ] Visual QA in a real browser (desktop + mobile) — couldn't get a live screenshot in this session, needs manual check
- [ ] CTA destinations decided (most buttons are placeholder `#` links, matching the source design)
- [ ] Additional pages (About, Contact, etc.)
- [ ] Cloudflare Pages connected
- [ ] Custom domain (timebacklab.com) DNS configured

## 2026-06-30 — Initial homepage build
- Imported design handoff bundle "# Timeback Brand DNA Development-handoff.zip" into `_handoff/`
- Read `Timeback Homepage.dc.html` (695 lines) — single-page design with 5 colour-blocked sections: Volt hero, Purple problem/stats, Yellow friction-fix, Cyan "Timeback Lab" process cards, Maroon final CTA
- Rebuilt as semantic HTML + external CSS/JS (source design used heavy inline styles, typical of design-tool prototypes)
- Resized/recompressed all 8 images (originals were 2048×2048 AI-generated PNGs at 8-9MB each)
- Added full mobile responsive design — original design only specified desktop layout
- Added a mobile hamburger nav menu (not present in source design)
- Preserved nav hide-on-scroll-down/show-on-scroll-up behaviour and the marquee auto-scroll animation from the original prototype's JS
- Kept placeholder `#` links as-is for buttons not wired to a real destination in the source design, rather than inventing pages out of scope

## Floating nav — confirmed against original spec
The nav is a floating pill, `position: fixed`, centred via `translate(-50%, 0)`. Two scroll-driven behaviours, both ported faithfully from the original `handleScroll` logic in the design file:
- **Hide on scroll down**: past 100px scrolled down, `.hidden` class slides it off-screen via `transform: translate(-50%, calc(-100% - 28px))`. Reappears immediately on scroll up. See `css/style.css` `#site-nav.hidden` and `js/main.js` `handleScroll()`.
- **Shadow deepens on scroll**: past 20px, `.scrolled` class adds `box-shadow: 0 14px 34px rgba(60,79,84,0.18)`.
- Home / About Us are plain anchor links (`#home` / `#about`) jumping to matching `id`s on the page (`<main id="home">`, the Cyan section `id="about"`). Contact Us is unwired, matching the source design.
- The only addition beyond the original spec is a mobile hamburger menu (`.nav-toggle` / `.nav-mobile-panel`), needed because the source design had no mobile nav behaviour defined and the links/button would otherwise overflow on small screens.

## 2026-07-02 — Legal/compliance updates to quiz intro page
- Added **marketing opt-in checkbox** with full consent copy: "Yes, I'd like occasional tips and toolkits on cutting operational noise, regaining control and finding the freedom to actually grow my business. If you don't like it, unsubscribe anytime."
  - Styling: unchecked = `#FFD0DC` fill with `2px #26292A` border; checked = `#EE0072` fill with `3px 3px 0 #000` shadow and checkmark
  - State stored as `marketingOptIn` boolean (default false), forwarded as URL param `marketingOptIn=1` or `0` on form submission
  - No server persistence yet — currently just passes flag to results page URL for future CRM integration
- Updated **email label** from "Email address (Required)" to "Email address (Required so we can email you the results)" for clarity
- Replaced **disclaimer button** ("The fine print") with inline **consent text**: "By clicking 'Let's go', you agree to our Terms & Conditions and acknowledge our Privacy Policy."
  - Terms & Conditions and Privacy Policy are placeholder `<a href="#">` links (need real URLs from legal)
  - No hard gating — clicking submit is treated as implied consent
  - Consent text positioned at `padding-left: 34px` to align with checkbox label
  - Negative margin (`-12px`) on button wrapper tightens vertical spacing between consent text and button
- Implemented checkbox toggle handler (`toggleMarketingOptIn()`) and click event listener
- All changes pushed to GitHub; Cloudflare Pages auto-deployed

### Open items (from legal handoff)
- Persist `marketingOptIn` server-side against lead record (no backend in this prototype)
- Replace placeholder `#` links with real Terms & Conditions and Privacy Policy URLs
- Confirm legal approval for "implied consent on click" vs. separate required checkbox

## 2026-07-02 — Quiz content & scoring logic reviewed (docs, no code changes)
- Compiled all 40 quiz questions (`js/quiz.js`), grouped by role/company type and category, plus all 4 result tiers and the full scoring logic, into a Google Doc for review: [Timeback Score Quiz — Questions, Results Logic & Scoring Review](https://docs.google.com/document/d/1qNuX7V2gWhFyLYTPv6uDJ0MX2ynkwBxnXwuNaNtGg2c/edit)
- No code was changed in this pass — documentation/review only.

### Issues flagged for follow-up (from the review doc)
- **Business size (Gate 1) currently has no effect.** It's asked and stored in `state.gating1` but never read anywhere else — only role (Gate 2) selects the question bank (`QUESTION_BANKS` in `js/quiz.js`). Decide whether to wire it into question selection/copy/benchmarking, or drop the question.
- **Displayed "Timeback Score" is inverted from the internal tier-health score.** `computeScore()` derives `percent` (0–100, high = healthy operations) to pick the tier, then shows `100 - percent` as the headline "Timeback Score" / "time you could recover." So a high displayed number actually means worse operations. Intentional marketing framing, but worth user-testing since it can read as "higher score = better" at a glance.
- **Leak-category tie-break always favours Systems** when two categories have equal (or near-equal) averages, due to category order + strict less-than comparison in `computeScore()`.
- **All quiz-results CTA buttons and "Order your report" are still placeholder `#` links** — not yet wired to booking pages, contact forms, or a paid-report flow.
- **No quiz results are persisted anywhere** (no DB/CRM/sheet integration) — consistent with existing `CLAUDE.md` note under "Timeback Score Quiz."

## 2026-07-02 — Quiz intro page implementation (redesign after handoff review)
Built new intro page per `Timeback Score Quiz - Intro.dc.html` handoff (replaces checkbox/consent approach from earlier session):

**Form & Validation**
- Optional company name field (text input, pink background)
- Required email address field (regex validated on keystroke: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- "Let's go" button disabled until email is valid; error message shown in Status Red (#CC0024)
- Form state preserved in `state` object: `companyName`, `email`

**UI & Styling**
- Intro page styled to match quiz card system: cyan stage, lime card, burgundy headline
- "Your progress" label on progress bar (4% filled as "just starting" indicator)
- Form labels sized to match quiz option-card titles (18px/800)
- Inputs styled like quiz option cards (pink #FFD0DC, rounded, magenta border on error)
- "The fine print (privacy & terms)" link: mono chip on left, "Let's go" button on right (stacked on mobile)

**Navigation & State Machine**
- Intro is step -1 (before gating question 0)
- Back button on first quiz question (step 0) navigates to intro
- Progress percentages recalculated: 7 total steps (4%, 15%, 27%, 40%, 53%, 67%, 85%, 100%)
- Progress bar label updated everywhere: "Your progress" (was "How much more")
- Email/company passed as URL params to quiz (e.g., `?email=...&company=...`) for future CRM integration

**Mobile Responsive**
- Buttons stack vertically on tablet (≤980px) and mobile (≤640px)
- Form scales appropriately: smaller fonts, tighter spacing, full-width inputs
- Footer visible on intro page (hidden on quiz steps 0-5, shown on results)

**Testing**
- Form validation works (button disabled on invalid email, enabled on valid)
- Navigation flow: intro → quiz question 1 → back to intro (state preserved)
- Error state: red border + error message clears when email becomes valid
- Mobile viewport (375px): responsive layout, no console errors
- Commit: `4a8f392` pushed and auto-deployed to https://timebacklab-website.pages.dev/quiz.html

**Open items**
- "The fine print" link currently `href="#"` — wire to privacy/terms page when available
- Email/company params not yet consumed by quiz (ready for backend/CRM integration)
- No persistence (client-side only)

## 2026-07-02 — Legal, Privacy & Terms page built and published
Built `legal.html` + `css/legal.css` from the Claude Design handoff (`Timeback Legal.dc.html` / its `README.md`), combining Terms & Conditions, the Timeback Diagnostic Disclaimer and the Privacy Policy on one page, copy taken verbatim from the handoff.

**What was done differently from the handoff file itself:**
- The handoff's own nav/footer markup was **not** used — it's a recurring problem with these Claude Design exports (flagged again this session): the handoff nav is narrower and has no mobile hamburger menu, and the handoff's footer has been missing entirely on at least one prior handoff. Instead, `#site-nav` and `footer` were copied verbatim from `index.html`/`quiz.html` (this site's actual, mobile-responsive components), with only the nav link `href`s adjusted for relative paths.
- Added anchor IDs to each major section (`#terms`, `#diagnostic-disclaimer`, `#privacy`) so other pages can deep-link to a specific part of the page, since the handoff didn't specify anchors.
- Verified in the browser preview at both desktop and mobile (375px) widths: hero, all three legal sections, footer, and the mobile hamburger menu all render and behave correctly.

**Linked from:**
- Homepage (`index.html`) and quiz (`quiz.html`) footer Legal column: Privacy → `legal.html#privacy`, Terms → `legal.html#terms` (previously `href="#"` placeholders)
- Quiz intro page consent line (`js/quiz.js`): "Terms & Conditions" → `legal.html#terms`, "Privacy Policy" → `legal.html#privacy` (previously `href="#"` placeholders)

**CLAUDE.md updated** with: the finished `legal.html` entry in the folder structure, a new "Legal Page" section, and a durable reminder (since this has now come up more than once) to always swap in this site's own nav/footer markup rather than a Claude Design handoff's copy of them, on every future page.

**Open items**
- Cookies and Compliance footer links still placeholder `#` — no such pages/policies exist yet
- No consent-management/cookie-banner implementation — out of scope for this pass, handoff didn't call for one

## 2026-07-02 — Quiz intro page: fixed button alignment and checkbox selected style
User flagged two visual bugs against a reference screenshot:
- **"Let's go" button was left-aligned instead of right-aligned.** `.intro-button-row` used `justify-content: space-between`, a leftover from an earlier layout that had a second element (the "fine print" link) in the row — with only the button left as a sole flex child, `space-between` pins it to the start. Changed to `justify-content: flex-end` (`css/quiz.css`).
- **Checked marketing opt-in checkbox didn't match the site's "selected" look and feel.** The quiz's answer buttons use a pink fill + `2px` border in the same colour + `6px 6px 0 #000` black offset shadow when selected (`.option-card.selected` in `css/quiz.css`). The checkbox's checked state only had a flat pink fill and a black checkmark — no shadow. Updated `js/quiz.js` to add a matching `stroke="#EE0072"` border and a white checkmark, and added `.checkbox-box.checked { box-shadow: 6px 6px 0 #000000; }` in `css/quiz.css` to bring in the offset-shadow treatment.
- Verified both fixes live via the browser preview (computed styles + DOM inspection, since screenshot capture was unavailable this session) before pushing. Commit `7e28a08`, pushed and auto-deployed.

## 2026-07-02 — Quiz results storage (D1) + password-gated admin viewer
Built the first backend for the site: every completed quiz now POSTs its full results to a Cloudflare Worker endpoint, which stores them in a Cloudflare D1 (serverless SQLite) database. All free tier, no new vendor.

**What's captured per submission:** company name, email, marketing opt-in, business size + role (the two gating questions), every individual question ID/category/question text/answer value, computed score/tier/leak category, a unique `submission_id` (UUID, for referencing a specific result later), plus what Cloudflare provides for free on every request: IP address, country, region, city, timezone, ISP/org name, ASN, and Cloudflare colo (data-centre) — no paid geolocation/fingerprinting service used. **Note:** a MAC address is never obtainable from a web request under any circumstances — that's local network hardware info with no browser/server exposure path; this was clarified with the user up front.

**Major surprise mid-build: the Cloudflare project had auto-migrated from classic Pages to Cloudflare's newer unified Workers platform**, evidenced by recurring bot commits ("Add Cloudflare Workers configuration" from `cloudflare-workers-and-config[bot]`, landing on a `cloudflare/workers-autoconfig` branch) that had been happening for hours before this session even started. This wasn't something we triggered — it appears to be an account-wide/background Cloudflare migration. Consequences:
- The classic `functions/` directory (Pages Functions file-based routing) **no longer works** — the unified Workers platform requires an explicit entry script (`main` in `wrangler.jsonc`) that does its own routing and falls back to `env.ASSETS.fetch(request)` for static files. Rebuilt accordingly as `src/index.js` (router) + `src/api/submit.js` + `src/api/admin-submissions.js`.
- The live URL changed from `timebacklab-website.pages.dev` (no longer resolves at all) to `timebacklab-website.thorespdonner.workers.dev`. **`timebacklab.com` and `www.timebacklab.com` are already connected as custom domains** on this Worker — DNS is done, contradicting the "once DNS is connected" caveat in the CLAUDE.md Deployment section, which should be updated.
- The dashboard's binding/secret UI ("Variables cannot be added to a Worker that only has static assets") wouldn't accept the D1 binding or `ADMIN_PASSWORD` secret until a real Worker script existed — merging the bot's `wrangler.jsonc` branch and adding `"main": "src/index.js"` unblocked this.
- A build got stuck indefinitely on "Initializing" (never reached Cloning/Installing/Deploying) — cancelled it and pushed an empty commit to retrigger; the retry deployed cleanly.

**Setup performed (dashboard, since `wrangler` CLI cannot install on this machine — see below):**
1. Created D1 database `timebacklab-quiz` via dashboard, ran `schema.sql`'s `CREATE TABLE submissions (...)` in the D1 Console.
2. Merged Cloudflare's auto-generated `wrangler.jsonc`, then added the `d1_databases` binding (`DB` → `timebacklab-quiz`) directly in that file (more reliable than the dashboard binding form, which silently failed to persist changes twice before the Worker script existed).
3. Added `.assetsignore` so `src/`, `functions/` (now removed), `docs/`, `schema.sql`, `wrangler.jsonc`, `CLAUDE.md` etc. aren't served as public static files alongside the real site pages.
4. Added `submission_id` column via `ALTER TABLE` (table already existed from step 1) plus a unique index.
5. **Still outstanding:** `ADMIN_PASSWORD` secret needs to be set via dashboard → Settings → Variables and Secrets (blocked earlier by the same "static assets only" error; should now work since the Worker script exists) — value agreed with user: not committed to this file for obvious reasons, see chat history / dashboard.

**node/wrangler note:** the user's machine is a Surface Pro 11 (Windows on ARM64). Cloudflare's `wrangler` CLI depends on the native `workerd` binary, which **has no Windows ARM64 build** (`npm install` fails with `Unsupported platform: win32 arm64 LE`). All Cloudflare-side setup for this project has to go through the web dashboard or direct edits to `wrangler.jsonc` committed via git — not the CLI — until/unless Cloudflare ships an ARM64 workerd build.

**Admin viewer:** `admin.html` — a single password-gated page (no site nav/footer, `noindex` + `robots.txt` disallow, not linked from anywhere) that POSTs the password as an `X-Admin-Password` header to `/api/admin/submissions` and renders the results as a table, with an expandable per-row JSON view of the full per-question answers.

**Resolution — confirmed working end-to-end.** `ADMIN_PASSWORD` secret was added via the dashboard (Settings → Variables and Secrets → type "Secret") once the Worker script existed, and `GET /api/admin/submissions` immediately returned the earlier test row correctly (including live geo data — correctly resolved to the user's real city). `admin.html` at `timebacklab.com/admin.html` logs in and renders the table as designed. The one leftover test row (`test-verify@example.com`) should be deleted via `DELETE FROM submissions WHERE email = 'test-verify@example.com';` in the D1 Console next time someone's in there.

**Lessons learned / gotchas for speeding up similar future work:**
1. **Before touching any Cloudflare project, check whether it's already been silently migrated from classic Pages to the unified Workers platform** — look for `cloudflare-workers-and-config[bot]` commits or a `cloudflare/workers-autoconfig` branch in the repo. If present, don't build against Pages Functions conventions (`functions/` directory) — build a single Worker entry script instead (`wrangler.jsonc`'s `main` field) that routes explicitly and falls back to `env.ASSETS.fetch(request)` for static files. This is now permanently documented in this project's CLAUDE.md, but the same check is worth doing at the start of any Cloudflare-hosted project going forward.
2. **The Cloudflare dashboard's binding/secret UI is unreliable until a real Worker script is deployed.** "Variables cannot be added to a Worker that only has static assets" is the tell. Don't keep retrying the same dashboard form — check for (or create) a committed `wrangler.jsonc`/`wrangler.toml` with a `main` entry first; editing bindings directly in that file is more reliable than the dashboard form anyway. Cloudflare Version History showing bot commits on a distinct branch chip (not `main`) is a strong signal worth investigating immediately, rather than assuming "no visible change" means nothing happened.
3. **A Cloudflare build stuck on "Initializing" with no progress for several minutes is a hung build, not a slow one.** Cancel it and push an empty commit (`git commit --allow-empty -m "..."`) to retrigger cleanly — this fixed it the one time it happened, no other diagnosis needed. (Cloudflare's own manual "New deployment" upload dialog is for static-assets-only uploads and explicitly recommends `wrangler deploy` for anything else — don't use it as a retrigger method for a project with bindings/a Worker script.)
4. **`wrangler` cannot install on Windows ARM64** (Surface Pro X/11 etc.) — its native `workerd` dependency has no ARM64 Windows build (`Unsupported platform: win32 arm64 LE`). Don't spend time debugging `npm install`/`npx wrangler` failures on such a machine; go straight to dashboard-driven setup + direct `wrangler.jsonc` edits committed via git instead. This is a durable environment fact (saved in Claude's cross-session memory as well as here).
5. **Cloudflare's Workers static-asset serving strips `.html` from URLs by default** (307 redirect, e.g. `/quiz.html` → `/quiz`) — harmless, existing internal links still resolve via the redirect, but don't mistake it for a broken route.
6. **When a non-technical user is walking through dashboard clicks for you, narrate one concrete instruction at a time** ("click X", "type Y") rather than a multi-step paragraph — this session went faster once that pattern was adopted, since the user doesn't know Cloudflare's terminology and dashboard layouts shift between account variants (e.g. sidebar sub-items and tab names differ from what's commonly documented).
7. Free-tier architecture used here (Cloudflare D1 + a single Worker + a hand-built password-gated HTML admin page) is a solid default answer any time a static/vanilla site on Cloudflare needs "collect a form and let me look at it later" with zero budget — worth reusing as the default pattern rather than reaching for a third-party form service.

## 2026-07-02 — Admin console rebuild (scalable menu + polished submissions view)
Reworked `admin.html` from a single login-then-table page into a three-view app, designed to scale as more admin areas get built:
- **Login view**: unchanged in structure, button now just reads "Log in" (was "View submissions").
- **Console menu view**: a card in the same visual style as the login card (bigger), titled `//timebacklab admin console` (the `lab` in Volt green, matching the site logo's `.logo-lab` treatment). Contains a `MENU_ITEMS` array of card-buttons, each with a round icon (green circle for the live item, dimmed grey for placeholders), title, subtitle, and a chevron on live items. Only **Timeback score submissions** is live (routes to the data view); the other three (**Paid requests for diagnostic reports**, **Group diagnostic reports**, **Customer account management**) render with a `| Not live` badge and are non-interactive `disabled` buttons. Adding a new live admin area going forward = add one object to `MENU_ITEMS` and one `if` branch in the menu-click handler — this is the "scalable" structure that was asked for.
- **Submissions view**: now a single wide card (logo + title in the header) instead of a bare table. Table columns trimmed to what was asked for (Submission ID, Date, Company, Email, Business size, Role, Tier, Leak, Score, Country, City — dropped Marketing OK/Region/ISP/IP/raw Answers from the visible grid, since that detail moved into the modal). Row/cell padding increased so it doesn't feel cramped. Toolbar adds **Group by company** (toggle, renders purple group-header rows) and **Sort by** (a field `<select>` + an ascending/descending toggle button) — both operate over the in-memory `submissions` array client-side, no new API needed for that part.
- **Detail modal**: clicking "View" opens a centered modal card with three labelled sections (Submission, Company & contact, Location) as a two-column definition-list grid, a divider, then a **Questions & answers** list (each question plus the option label the respondent clicked, pulled straight from the existing `answers_json` — no schema change needed there). Close button dismisses the modal (also closes on backdrop click); **Delete record** button confirms, then calls the new `DELETE /api/admin/submissions` endpoint and removes the row from the in-memory list + table without a full reload.
- **Backend addition**: `src/api/admin-submissions.js` now exports `handleDeleteSubmission` (DELETE, same `X-Admin-Password` gate as the GET, expects `{ submissionId }` JSON body, deletes by `submission_id`) alongside the existing `handleAdminSubmissions`. Wired into `src/index.js`'s router as `DELETE /api/admin/submissions`. No schema change — reuses the existing `submissions` table and its unique `submission_id` index.
- Verified locally via the Python static-file preview server (no Worker/API available there) by stubbing the `submissions` array and calling the page's own render functions directly in the browser console — confirmed menu rendering, live/not-live card styling, table grouping, sorting, and the full detail modal all render and behave as designed. The live D1-backed login/GET/DELETE flow itself could not be exercised locally (no `wrangler` on this ARM64 machine — see gotcha #4 above) and should be spot-checked against the real `timebacklab.com/admin.html` after this deploy lands.
- Pushed straight to `main` per this session's instruction to "publish immediately" — deploy triggers automatically via Cloudflare's build pipeline as usual.

## 2026-07-02 — Detailed report content written (309 cells) + admin content-manager spec (TO BUILD)
Authored the full written content for the bespoke Timeback Score report and specced the admin tool to maintain it. **No code/site changes this pass — content + docs only.**
- **Content:** [`docs/report-nodes.md`](report-nodes.md) — all 309 report cells filled: 192 section summaries (section × company size × role × tier) + 117 question nodes (Q1–Q10 × role × size; Q10 has no Office version). Brand voice (British English, no em dash, no Oxford comma, second person, strategic not tactical), steered by the operations research Google Doc (`1-gHMlgGiSc5tUiqzo3o0_uxXe7Sbv6FhrsBJPT93OBk`) and the writing style guide. Mirrors the node-grid Google Doc (`11HRy2Mw7w8AirGjQtyKW0jwPOCWU2dogrwRPjcSWuNc`). Tech framed as an enabler, never the lead.
- **Decision:** rather than maintain content in a Google Doc (copy-paste drift risk), move it into Cloudflare D1 and manage it in the admin console. D1 becomes the single source of truth; `report-nodes.md` is the seed + backup. Dynamic report generation is a **separate later phase**.
- **Spec to build next session:** [`docs/report-content-admin-spec.md`](report-content-admin-spec.md) — new admin menu item **"Manage detailed report replies"**: a long list of all replies (ID · role · company size · question/overview label · text preview), each with a **View** button opening a modal to view/edit/save (reusing the existing submissions-modal styling and the `MENU_ITEMS` scalable pattern). Includes the D1 schema (`report_nodes` table with composite string IDs), seed approach, and the `GET`/`PUT /api/admin/report-nodes` endpoints (same `X-Admin-Password` gate). Remember: schema + seed SQL must be pasted into the D1 dashboard Console by hand (no `wrangler` on this ARM64 machine).

## 2026-07-02 — Admin "Manage detailed report replies" content manager built
Built the content-management tool from [`docs/report-content-admin-spec.md`](report-content-admin-spec.md) (the report *generator* remains a separate later phase). D1 is now the single source of truth for report content; `report-nodes.md` is the seed + backup.
- **Seed:** [`schema/report-nodes-seed.sql`](../schema/report-nodes-seed.sql) — `report_nodes` table + all **309** INSERTs, generated from `report-nodes.md` by a parser script (192 summaries + 117 question nodes; Q10 Office correctly excluded, apostrophes escaped, `word_count` precomputed, `updated_at` NULL). File starts with `DROP TABLE IF EXISTS`, so **re-running it wipes admin edits** — it is a one-time initial load. Must be pasted into the D1 dashboard Console by hand (no `wrangler` on ARM64). **Pending: user still needs to paste it into the Console for the live DB.**
- **API:** [`src/api/report-nodes.js`](../src/api/report-nodes.js) — `GET /api/admin/report-nodes` (all rows) and `PUT /api/admin/report-nodes` (`{ id, body }` → updates body, recomputes word_count, sets updated_at). Same `X-Admin-Password` gate and `env.DB` binding as `admin-submissions.js`; routed in [`src/index.js`](../src/index.js). PUT returns 404 if the id does not exist.
- **UI:** new `MENU_ITEMS` entry + `report-nodes-view` in [`admin.html`](../admin.html), matching the existing console/submissions styling exactly. Long table (ID · Section · Role · Company size · Tier/question · Preview + View), with group-by-section toggle, section/role filters, and an id/text search box (309 rows). View opens a modal (reused submissions-modal styling) with reply metadata, an editable textarea, a live word count, and Save (calls PUT, updates the row in place, shows the new saved timestamp). Nodes are fetched lazily when the menu card is clicked.
- **Verified** locally via the static preview with mock data: list render, filters, grouping, modal open, live word count, and the save flow (mocked PUT) all work; no console errors. The Worker/D1 API itself can only be verified once deployed + the seed is pasted (can't run `wrangler` here).
- **Open items:** paste the seed into the D1 Console; then commit/push and confirm the live admin screen loads real rows and saves persist.
