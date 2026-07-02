# timebacklab Website — Setup

## Stack
- Vanilla HTML5 + custom CSS, no frameworks
- Hosted on Cloudflare Pages (free tier)
- Source repo: https://github.com/thoredee/timebacklab-website

## Pipeline
1. Edit files locally in this folder (`C:\Users\thore\OneDrive\Claude Development\timebacklab-website\`)
2. `git add` / `git commit` / `git push origin main`
3. Cloudflare Pages watches the `main` branch and auto-redeploys on every push — no manual trigger needed

## Cloudflare Pages config
- Production branch: `main`
- Framework preset: None
- Build command: (none)
- Build output directory: `/`
- Live URL: https://timebacklab-website.pages.dev/ (custom domain timebacklab.com to be connected)

## Local git identity
Set locally (not global) for this repo only:
- user.email: thorespdonner@gmail.com
- user.name: Thore Donner

```bash
git config user.email "thorespdonner@gmail.com"
git config user.name "Thore Donner"
```

## Folder structure
```
timebacklab-website/
  index.html
  quiz.html
  css/
    style.css
    quiz.css
  js/
    main.js
    quiz.js
  images/
    marquee-team.jpg, marquee-coffee.jpg, marquee-education.jpg,
    marquee-craft.jpg, marquee-florist.jpg, time-monster.webp,
    friction-collage.webp, cupcake.webp, quiz-report-photo.webp
  docs/
    SETUP.md
    PROGRESS.md
  _handoff/        (gitignored, Claude Design export reference)
  .gitignore
  CLAUDE.md
```

## Local preview
Static site, no build step. Serve it with any static server, e.g.:
```bash
python -m http.server 8731
```
Then open http://localhost:8731/index.html or http://localhost:8731/quiz.html

## Pages
- **Home** (index.html) — built from the Claude Design "Timeback Homepage" handoff. Single page, five colour-blocked sections + footer.
- **Quiz** (quiz.html) — Timeback Score adaptive diagnostic
  - **Intro page** (step -1): Email gating form with optional company name capture. Progress bar shows "Your progress" at 4%.
  - **Gating questions** (steps 0–1): Business size ("What's the size of your business?") → Role ("What's your role, day to day?"). Selects the question bank for the user's persona.
  - **Category questions** (steps 2–5): 10 role-specific questions grouped into 4 categories (Systems, Delegation, Prioritisation, Tech). Progress bar advances from 15% to 85%.
  - **Results** (step 6): Tier-based outcome (Trapped/Overloaded/Stretched/In the driver's seat) with score gauge, top time leak, and upsell section. Progress at 100%.
  - Client-side state machine with no persistence (ready for CRM/backend integration when available).
  - Linked from homepage's "Start your Timeback Score" button.

Built from Claude Design handoff bundles. See `docs/PROGRESS.md` for detailed build history and open items.
