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
- **Quiz** (quiz.html) — Timeback Score adaptive diagnostic (10 questions, gated by business size/role). Client-side state machine with tier-based results. Linked from homepage's "Start your Timeback Score" button.

Built from Claude Design handoff bundles. See `docs/PROGRESS.md` for build history.
