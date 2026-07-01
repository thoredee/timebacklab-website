# timebacklab Website

## Overview
Marketing site for timebacklab (Timeback Lab) — a brand helping small business owners reclaim time from operational admin using AI and smart process fixes. Vanilla HTML5 + custom CSS, hosted on Cloudflare Pages. Built from a Claude Design handoff bundle.

## Stack
- Vanilla HTML5 + custom CSS (no frameworks)
- Hosted on Cloudflare Pages (free tier)
- Source repo: https://github.com/thoredee/timebacklab-website
- Local folder: `C:\Users\thore\OneDrive\Claude Development\timebacklab-website\`

## Deployment Pipeline
1. Edit files locally
2. `git add` / `git commit` / `git push origin main`
3. Cloudflare Pages auto-deploys on every push — no manual trigger needed

## Cloudflare Pages Configuration
- **Production branch**: `main`
- **Framework preset**: None
- **Build command**: (none)
- **Build output directory**: `/`
- **Live URL**: https://timebacklab-website.pages.dev/ (plus timebacklab.com once DNS is connected in Cloudflare)

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
  ├── css/
  │   ├── style.css            Shared nav, footer, homepage sections
  │   └── quiz.css             Quiz-specific styles (stage, cards, results, tier themes)
  ├── js/
  │   ├── main.js              Nav scroll behaviour, mobile menu, marquee animation
  │   └── quiz.js              Quiz state machine, scoring, and rendering (vanilla JS, no framework)
  ├── images/                  Compressed production images (see Image Pipeline below)
  ├── docs/
  │   ├── SETUP.md
  │   └── PROGRESS.md
  ├── _handoff/                 Claude Design export — gitignored, reference only
  ├── .gitignore
  └── CLAUDE.md
```

## Timeback Score Quiz
`quiz.html` is a 10-question adaptive diagnostic (gated by business size + role) that produces a Timeback Score and a tier-based result (Trapped / Overloaded / Stretched / In the driver's seat). It was originally handed off from Claude Design as a "Design Component" (DC) bundle that depended on a React-based runtime (`support.js`) loaded from a CDN. That runtime was **not used** — it conflicted with the site's vanilla, no-framework stack, had no mobile hamburger nav, and had a results-page width bug (hardcoded `max-width:1600px` override plus fixed-pixel dimensions on the report section). Instead, the quiz was rebuilt as plain HTML/CSS/JS: `js/quiz.js` reimplements the same question banks, scoring logic and tiers as a small vanilla state machine that re-renders `#quiz-root` on each interaction, and `quiz.css` reuses the homepage's nav/footer styles from `style.css` plus tier theming via CSS custom properties (`--tier-bg`, `--tier-heading`, etc. set through `[data-tier="..."]` selectors).

Current scope: the quiz runs entirely client-side and does not persist results anywhere (no database/sheet integration yet — a future step). The tier CTA buttons and "Order your report" button are still placeholder `#` links, same as other homepage CTAs.

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
1. Review the homepage locally and confirm it matches expectations
2. Decide on a real destination for "Speak to someone" / "Contact Us" (mailto, contact page, or booking link)
3. Build additional pages (About, Contact) when ready, following the same handoff → build pipeline
4. Push to GitHub and verify Cloudflare Pages auto-deploy
5. Connect timebacklab.com DNS in Cloudflare
