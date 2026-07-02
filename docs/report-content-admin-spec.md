# Spec — Admin "Manage detailed report replies" (content management)

**Status: TO BUILD (next session).** This is a self-contained brief. The content itself is already
written in [`docs/report-nodes.md`](report-nodes.md) (309 cells). This spec covers moving that
content into Cloudflare D1 and building an admin screen to view/edit/save it. **Building the actual
report generator is a SEPARATE, LATER phase and is out of scope here.**

## Goal
Store every report "reply" (content cell) in D1, and add an admin console area to review, edit and
save them, so the content is maintainable in one place. D1 becomes the single source of truth;
`report-nodes.md` is the initial seed and a backup.

## The content = two node types (309 rows total)
- **Section summaries** — 192 rows, keyed by `section` × `company_size` × `role` × `tier`.
- **Question nodes** — 117 rows, keyed by `question_id` × `role` × `company_size`
  (Q10 has no Office version, so it is 9 not 12).

Dimensions:
- `section`: systems · delegation · prioritisation · tech
- `company_size`: solo · small · medium (Solo/Micro 1–5 · Small 6–25 · Medium/Large 26+)
- `role`: boss · lead · office · field (a.k.a. operator/leader/office/field)
- `tier`: trapped · overloaded · stretched · driver (section summaries only)
- `question_id`: q1…q10

## Each reply needs a stable ID
Use a human-readable composite ID (easier to maintain and matches the keys):
- Section summary: `sum-{section}-{size}-{role}-{tier}` → e.g. `sum-systems-solo-boss-trapped`
- Question node: `{question_id}-{role}-{size}` → e.g. `q1-boss-solo`

## Data model (D1)
One content table is enough, with a `node_type` discriminator and nullable keys:

```sql
CREATE TABLE report_nodes (
  id           TEXT PRIMARY KEY,              -- composite id above
  node_type    TEXT NOT NULL,                 -- 'summary' | 'question'
  section      TEXT NOT NULL,                 -- systems|delegation|prioritisation|tech
  role         TEXT NOT NULL,                 -- boss|lead|office|field
  company_size TEXT NOT NULL,                 -- solo|small|medium
  tier         TEXT,                          -- trapped|overloaded|stretched|driver (summaries only)
  question_id  TEXT,                          -- q1..q10 (questions only)
  label        TEXT NOT NULL,                 -- human label for the list, e.g. "Systems · Overview" or "Systems · Q1"
  body         TEXT NOT NULL,                 -- the report text
  word_count   INTEGER,
  updated_at   TEXT                           -- ISO timestamp, set on save
);
```
(Optional reference tables for section/role/size/tier/question wording can be added later if the UI
wants to build itself from them; not required for v1.)

## Seed
Generate one SQL seed file (`schema/report-nodes-seed.sql`) from `docs/report-nodes.md`. Because
`wrangler` cannot run on this machine (Surface Pro 11, ARM64), the schema + seed SQL must be
**pasted by hand into the Cloudflare D1 dashboard Console** — same manual step used for the
`submissions` table. Everything else deploys normally on git push.

## API (extend the existing Worker, reuse the `X-Admin-Password` gate)
Add to `src/api/` and route in `src/index.js`, mirroring `admin-submissions.js`:
- `GET  /api/admin/report-nodes` — return all rows (id, label, role, company_size, tier/question, body). Password-gated.
- `PUT  /api/admin/report-nodes` — body `{ id, body }`; update `body`, recompute `word_count`, set `updated_at`. Password-gated.

## Admin UI — new menu item "Manage detailed report replies"
Follow the existing scalable console pattern in `admin.html`:
- Add an entry to `MENU_ITEMS` and a branch in the menu click handler (the same way "Timeback score
  submissions" is wired). **Must match the existing admin design and style exactly** (login → menu →
  data view shell, same cards/typography/colours).
- **The view is a long list** of all replies. Each row shows: **ID · role · company size ·
  question-or-overview (label) · a preview of the text**. Sort/group by section is a nice-to-have.
- Each row has a **View** button that opens a **popup/modal** (reuse the existing submissions detail
  modal styling) showing the full text, with an **Edit** mode (textarea) and a **Save** button.
- Save calls `PUT /api/admin/report-nodes`, updates the row in place, shows the new `updated_at`.
- Show a word count in the editor to keep lengths consistent.

## Build order
1. Write `schema/report-nodes-seed.sql` (schema + 309 INSERTs generated from `report-nodes.md`).
2. Walk the user through pasting it into the D1 Console.
3. Add `src/api/report-nodes.js` (GET + PUT) and route it in `src/index.js`.
4. Add the "Manage detailed report replies" menu item + list + view/edit/save modal to `admin.html`.
5. Commit, push, verify live.

## Out of scope (next phase)
Dynamic report generation (matching a completed survey to these rows and rendering the report).
The DB rows are designed so that engine is a clean follow-on with no rework.

## Voice rules for any edits (keep consistent)
British English, no em dash, no Oxford comma, second person, benefit before feature, strategic not
tactical. See `_handoff/.../timeback Writing Style Guide.dc.html` and the header of `report-nodes.md`.
