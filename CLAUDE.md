# timebacklab Website

## Overview
Marketing site for timebacklab (Timeback Lab) — a brand helping small business owners reclaim time from operational admin using AI and smart process fixes. Vanilla HTML5 + custom CSS, served by a Cloudflare Worker (static assets + a small API). Built from a Claude Design handoff bundle.

## Stack
- Vanilla HTML5 + custom CSS (no frameworks) for all pages
- A single Cloudflare Worker (`src/index.js`) serves the static site via `env.ASSETS.fetch()` and handles two API routes (`/api/submit`, `/api/admin/submissions`) backed by a Cloudflare D1 database — all free tier, no new vendor
- Source repo: https://github.com/thoredee/timebacklab-website
- Local folder: `C:\Users\thore\OneDrive\Claude Development\timebacklab-website\`

## Deployment Pipeline
1. Edit files locally
2. `git add` / `git commit` / `git push origin main`
3. Cloudflare auto-builds and deploys on every push (`npx wrangler deploy` under the hood) — no manual trigger needed. Occasionally a build hangs on "Initializing" indefinitely; if so, cancel it in the Deployments tab and push an empty commit (`git commit --allow-empty`) to retrigger — this resolved it the one time it happened.

## Cloudflare Configuration — important: this project runs on Cloudflare's unified **Workers** platform, not classic Pages
**This is not the original setup.** The project was originally built and deployed as classic Cloudflare Pages (static-only, `functions/` directory for any backend code). Partway through building the quiz-results storage feature (2026-07-02), it became clear Cloudflare had auto-migrated the project to its newer unified Workers platform in the background — evidenced by recurring bot commits ("Add Cloudflare Workers configuration" from `cloudflare-workers-and-config[bot]`) landing on a `cloudflare/workers-autoconfig` branch, going back hours before that was even noticed. **If you're reading this in a future session and something about deployment seems off versus what you'd expect from "classic Pages," this migration is why** — see `docs/PROGRESS.md`'s 2026-07-02 entry for the full diagnostic story.

Consequences of the Workers model (vs. classic Pages) that matter for future work:
- **No `functions/` directory auto-routing.** Any backend code must be explicit: `wrangler.jsonc`'s `"main"` points at `src/index.js`, which routes known API paths itself and falls back to `env.ASSETS.fetch(request)` for everything else (the actual site pages/assets).
- **Bindings and secrets (D1, `ADMIN_PASSWORD`, etc.) only work once a real Worker script exists.** The dashboard's Bindings/Variables-and-Secrets UI will reject changes with "Variables cannot be added to a Worker that only has static assets" until `wrangler.jsonc` has a `main` entry. D1 bindings are configured by editing `d1_databases` directly in `wrangler.jsonc` (more reliable than the dashboard's "Add binding" form, which silently failed twice before the script existed) — the dashboard is only needed for the `ADMIN_PASSWORD` secret (Settings → Variables and Secrets → Encrypt).
- **Static asset serving strips `.html` by default** — e.g. `/quiz.html` 307-redirects to `/quiz` before serving 200. Harmless (internal links still resolve), just don't be surprised by it.
- **Live URLs**: `https://timebacklab-website.thorespdonner.workers.dev/` (the old `timebacklab-website.pages.dev` no longer resolves at all) — **and `timebacklab.com` / `www.timebacklab.com` are already connected as custom domains** (check Domains tab on the Worker) — DNS is done, this is no longer a "Next Step".
- **`wrangler` CLI cannot run on this machine.** The user's machine is a Surface Pro 11 (Windows ARM64); `wrangler`'s native `workerd` dependency has no Windows ARM64 build (`npm install` fails: `Unsupported platform: win32 arm64 LE`). All Cloudflare-side config changes (bindings, secrets, D1 schema) have to go through the web dashboard or direct `wrangler.jsonc` edits committed via git — never assume `wrangler` commands can be run locally to verify or fix something.
- **Build command**: none (per `wrangler.jsonc`) — deploy command is `npx wrangler deploy`, run by Cloudflare's own build pipeline on push, not locally.

## Local Git Setup
Set locally (not global) for this repo:
```bash
git config user.email "thorespdonner@gmail.com"
git config user.name "Thore Donner"
```

## Folder Structure
```
timebacklab-website/
  ├── index.html              Home page
  ├── quiz.html               Timeback Score Quiz (linked from homepage's "Start your Timeback Score" button)
  ├── legal.html              Legal, Privacy & Terms page (Terms & Conditions, Diagnostic Disclaimer, Privacy Policy — anchors #terms/#diagnostic-disclaimer/#privacy)
  ├── admin.html               Password-gated viewer for stored quiz submissions (not linked from site nav; noindex + robots.txt disallow)
  ├── robots.txt               Disallows /admin.html from search indexing
  ├── css/
  │   ├── style.css            Shared nav, footer, homepage sections
  │   ├── quiz.css             Quiz-specific styles (stage, cards, results, tier CTA colours)
  │   └── legal.css            Legal page styles
  ├── js/
  │   ├── main.js              Nav scroll behaviour, mobile menu, marquee animation
  │   └── quiz.js              Quiz state machine, scoring, rendering, and POSTs final results to /api/submit
  ├── images/                  Compressed production images (see Image Pipeline below)
  ├── src/                     Cloudflare Worker source (see "Quiz Results Storage" below)
  │   ├── index.js             Worker entry point — routes /api/* then falls back to static assets
  │   └── api/
  │       ├── submit.js          Handles POST /api/submit — writes a quiz result row to D1
  │       ├── admin-submissions.js  Handles GET /api/admin/submissions — password-gated read of all rows
  │       └── report-nodes.js       Handles GET + PUT /api/admin/report-nodes — password-gated read/edit of report content cells
  ├── wrangler.jsonc           Worker config: entry point, D1 binding, assets directory (committed, not secret — no passwords in here)
  ├── schema.sql               D1 table schema (submissions) — run manually in the D1 dashboard Console, not auto-applied
  ├── schema/
  │   └── report-nodes-seed.sql   D1 schema + 309 seed INSERTs for the report_nodes content table — pasted by hand into the D1 Console (see Detailed Report Content Manager below)
  ├── .assetsignore            Excludes src/, docs/, schema.sql, wrangler.jsonc etc. from being served as public static files
  ├── docs/
  │   ├── SETUP.md
  │   ├── PROGRESS.md
  │   ├── report-nodes.md               Source content for all 309 report cells (seed + backup; D1 is the live source of truth)
  │   └── report-content-admin-spec.md  Spec for the "Manage detailed report replies" admin content manager
  ├── _handoff/                 Claude Design export — gitignored, reference only
  ├── .gitignore
  └── CLAUDE.md
```

## Timeback Score Quiz
`quiz.html` is a 10-question adaptive diagnostic (gated by business size + role) that produces a Timeback Score and a tier-based result (Trapped / Overloaded / Stretched / In the driver's seat). It was originally handed off from Claude Design as a "Design Component" (DC) bundle that depended on a React-based runtime (`support.js`) loaded from a CDN. That runtime was **not used** — it conflicted with the site's vanilla, no-framework stack, had no mobile hamburger nav, and had a results-page width bug (hardcoded `max-width:1600px` override plus fixed-pixel dimensions on the report section). Instead, the quiz was rebuilt as plain HTML/CSS/JS: `js/quiz.js` reimplements the same question banks, scoring logic and tiers as a small vanilla state machine that re-renders `#quiz-root` on each interaction, and `quiz.css` reuses the homepage's nav/footer styles from `style.css`.

The results screen (score gauge + leak card) has a **fixed purple background** (`#480078`) with `#DDD0FF` headline text on every tier — this was a deliberate brand-consistency request, not tier-driven. Only the CTA button colour still varies by tier, via `--tier-cta-bg` / `--tier-cta-color` custom properties set through `.results-section[data-tier="..."]` selectors in `quiz.css`. The leak card body text always leads with "Your number one time leak is [category]." before the category blurb.

A quiz **intro page** (company name + required, validated email, marketing opt-in, consent copy) was added ahead of the gating questions. Its consent line links out to `legal.html#terms` and `legal.html#privacy` — see `docs/PROGRESS.md` for the detailed build log of that work.

The tier CTA buttons and "Order your report" button are still placeholder `#` links, same as other homepage CTAs.

## Quiz Results Storage
Every completed quiz POSTs its full results to `/api/submit` (fired once, from `js/quiz.js`'s `render()` the first time the results screen shows), which is handled by the Cloudflare Worker (`src/api/submit.js`) and written to a Cloudflare D1 database (`timebacklab-quiz`, table `submissions`, schema in `schema.sql`). Captured per row: company name, email, marketing opt-in, business size + role, every individual question/category/answer (full detail, not just the summary), computed score/tier/leak category, a unique `submission_id` (UUID) for referencing one result later, and whatever Cloudflare provides for free on every request — IP address, country, region, city, timezone, ISP/org, ASN, and Cloudflare colo. **A MAC address is never obtainable from a web request under any circumstances** (no browser/server exposure path) — don't attempt this again if asked, explain why instead.

Results are viewed via `admin.html`, a password-gated page (not linked from site nav, `noindex` + `robots.txt` disallow) that sends the password as an `X-Admin-Password` header to `GET /api/admin/submissions` (`src/api/admin-submissions.js`), checked against the `ADMIN_PASSWORD` secret set in the Cloudflare dashboard (Settings → Variables and Secrets → Encrypt) — never stored in the repo.

`admin.html` is a multi-view app (login → console menu → data views), built as a scalable shell for future admin areas: after login, a menu card lists admin sections as icon card-buttons (`MENU_ITEMS` array in the page's script) — **Timeback score submissions** and **Manage detailed report replies** are live; **Paid requests for diagnostic reports**, **Group diagnostic reports**, and **Customer account management** are placeholder entries marked "Not live" pending future build-out. To add a new live admin area later: add an entry to `MENU_ITEMS`, add a `<div id="...-view">` block, add it to the `showView` array, and add a branch in the menu click handler. The submissions data view is a wide card with grouping (by company) and per-field sorting, and a "View" button per row opens a detail modal (submission/company/location fields, then the full question-by-question answers) with **Close** and **Delete record** actions — delete calls `DELETE /api/admin/submissions` (also in `src/api/admin-submissions.js`, same password gate, deletes by `submission_id`).

See the Cloudflare Configuration section above for the Workers-platform quirks (bindings, `.html` URL stripping, no `wrangler` CLI locally) that shaped how this had to be built, and `docs/PROGRESS.md`'s 2026-07-02 entry for the full build/debugging story.

## Detailed Report Content Manager
The bespoke Timeback Score report is assembled from **309 pre-written content cells** ("report nodes"): 192 section summaries (keyed `section` × `company_size` × `role` × `tier`) + 117 question nodes (keyed `question_id` × `role` × `company_size`; Q10 has no Office version, so 9 not 12). The written content lives in `docs/report-nodes.md` (the seed + backup) but **Cloudflare D1 is the live source of truth** — table `report_nodes` in the same `timebacklab-quiz` database, schema + all 309 seed INSERTs in `schema/report-nodes-seed.sql`. Composite string IDs, not UUIDs: summaries `sum-{section}-{size}-{role}-{tier}`, questions `{question_id}-{role}-{size}`.

Managed via the **"Manage detailed report replies"** admin menu item: a long filterable/searchable/groupable table of every reply, each with a **View** button opening a modal to view/edit the body text (live word count) and **Save** — Save calls `PUT /api/admin/report-nodes` (`{ id, body }` → updates body, recomputes `word_count`, sets `updated_at`), read via `GET /api/admin/report-nodes`, both in `src/api/report-nodes.js` behind the same `X-Admin-Password` gate. Nodes are fetched lazily when the menu card is clicked.

**Seeding the table is a one-time manual paste** into the D1 dashboard Console (no `wrangler` on ARM64), same as `schema.sql`. The seed file starts with `DROP TABLE IF EXISTS report_nodes`, so **re-running it wipes any edits made through the admin screen** — only re-run it to reset content to the `report-nodes.md` baseline. If `report-nodes.md` is later re-edited in bulk, regenerate the seed with the parser approach and note that re-pasting overwrites live edits.

**Out of scope so far:** the actual report *generator* (matching a completed submission to these rows and rendering the report) is a separate later phase — see `docs/report-content-admin-spec.md`.

## Legal Page (`legal.html`)
Built from a Claude Design handoff (`Timeback Legal.dc.html`) combining Terms & Conditions, the Timeback Diagnostic Disclaimer and the Privacy Policy on one page, with anchor IDs (`#terms`, `#diagnostic-disclaimer`, `#privacy`) so other pages can deep-link to a specific section. Linked from: the homepage/quiz footer's Legal column (Privacy → `#privacy`, Terms → `#terms`), and the quiz intro page's consent line ("Terms & Conditions" → `#terms`, "Privacy Policy" → `#privacy`). Styles live in `css/legal.css`; it reuses `#site-nav` and `footer` from `css/style.css` (see the important reminder below — do NOT reuse a Claude Design handoff's own nav/footer markup).

**Important, recurring reminder (do not reuse the Claude Design handoff's nav/footer verbatim):** every Claude Design handoff `.dc.html` file includes its own copy of the nav and footer, but that copy is **not wide/complete enough for this site** — it's missing the mobile hamburger menu (`.nav-toggle` / `.nav-mobile-panel`) that was custom-built for this site, and has been forgotten by the design tool before. When building any new page from a handoff, **always swap in this site's actual `#site-nav` and `footer` markup** (copy verbatim from `index.html` or `quiz.html`, adjusting only the nav link `href`s for relative paths) instead of the handoff's own nav/footer. The footer must appear on every page, no exceptions.

## Design Source
Built from a Claude Design handoff bundle (`_handoff/timeback-brand-dna-development/`), specifically `project/Timeback Homepage.dc.html`. That folder also contains a Brand DNA doc, Component Guide, and Writing Style Guide for the wider brand — useful reference if more pages are built later. The `_handoff` folder is gitignored; it's a local reference only, not part of the deployed site.

## Brand Palette (from the homepage design)
| Colour | Hex | Use |
|---|---|---|
| Volt | `#C6E000` | Primary brand colour — hero section, "lab" wordmark, accents |
| Volt dark | `#4A4800` | Headline/body text on Volt backgrounds |
| Purple | `#480078` | Problem section background |
| Purple light | `#C8B4EE` | Text on purple |
| Pink | `#FF4081` | Stat card |
| Lilac | `#C87DFF` | Time-eaters card |
| Yellow | `#FFD400` | "Fix the friction" section |
| Cyan | `#00BBFF` | "Timeback Lab" section |
| Magenta | `#DD004C` | Lab process cards |
| Pink pale | `#FFC2CE` | Lab card icons, footer background |
| Maroon | `#780016` | Final CTA section |
| Blue | `#0057FF` | Final CTA button |
| Ink | `#26292A` | Body text, nav |
| Paper | `#FBF9F2` | Nav pill, footer card |

## Typography
- **Plus Jakarta Sans** — all body copy and headings (weights 300–800)
- **JetBrains Mono** — not used on the homepage itself (used in other handoff docs like the style guide)

## Image Pipeline
The handoff bundle's source images (AI-generated via Gemini) were 2048×2048 PNGs at 8–9MB each — unusable for a live site. They were resized and re-encoded into `images/`:
- Opaque marquee photos → JPEG, max 900px, quality 82 (~140–185KB each)
- Transparent cutout graphics (time-monster, friction collage, cupcake) → WebP with alpha, quality 82

Processing script used `Pillow` (Python). If you add more images from future handoff exports, follow the same approach — check `Image.split()[-1].getextrema()` to see if alpha is actually used before deciding JPEG vs WebP.

## Mobile Responsiveness
Two breakpoints: `980px` (tablet — collapse to single column, 2-col footer/lab cards) and `640px` (mobile — full single column, hamburger nav menu, stacked CTA buttons, smaller type scale). The original design only specified desktop layout; all mobile breakpoints were authored during implementation.

## Known Placeholder Links
Most CTA buttons link to `#` — this matches the source design, which only wired up "Meet the time eaters" → `#problem`. No Contact, About, Blog, etc. pages exist yet. Wire these up once those pages are built or a real contact method (email/form) is decided.

## Next Steps
1. Decide on a real destination for "Speak to someone" / "Contact Us" (mailto, contact page, or booking link)
2. Build additional pages (About, Contact) when ready, following the same handoff → build pipeline
3. Wire the footer's Cookies/Compliance links, and the remaining Product/Company/Resources footer columns, once those pages/policies exist
4. Consider a CSV export or reporting view beyond the raw `admin.html` table, and a data retention/deletion policy for stored quiz submissions (relevant given the Legal/Privacy page commitments)

## Ongoing Record-Keeping
Every time a change is built and pushed live, update `docs/PROGRESS.md` with a dated entry (what was built, why, and any open items) and update this CLAUDE.md if the change affects folder structure, known placeholders, or a durable rule future sessions need to know. This has been the practice since the quiz work began — check `docs/PROGRESS.md`'s dated entries for the ongoing history rather than re-deriving it from git log.
