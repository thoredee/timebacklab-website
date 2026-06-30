# timebacklab Website — Progress

## Project Status
- [x] Repo created and cloned locally
- [x] Design handoff received (Claude Design export) and extracted to `_handoff/`
- [x] Homepage built from `Timeback Homepage.dc.html` (5 sections + nav + footer)
- [x] Source images compressed for web (48MB → ~1MB total)
- [x] Mobile responsive breakpoints added (980px tablet, 640px mobile)
- [x] Mobile hamburger nav menu added (not in original design, needed for small screens)
- [x] Local server verified — all assets resolve with 200
- [ ] Visual QA in a real browser (desktop + mobile) — couldn't get a live screenshot in this session, needs manual check
- [ ] CTA destinations decided (most buttons are placeholder `#` links, matching the source design)
- [ ] Additional pages (About, Contact, etc.)
- [ ] Pushed to GitHub
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
