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
  css/
    style.css
  js/
    main.js
  images/
    marquee-team.jpg, marquee-coffee.jpg, marquee-education.jpg,
    marquee-craft.jpg, marquee-florist.jpg, time-monster.webp,
    friction-collage.webp, cupcake.webp
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
Then open http://localhost:8731/index.html

## Pages
- **Home** (index.html) — built from the Claude Design "Timeback Homepage" handoff. Single page, five colour-blocked sections + footer.

Built from a Claude Design handoff bundle. See `docs/PROGRESS.md` for build history.

## Editing the site yourself (without Claude Code)

**Small edits (text, links, colours):**
1. Go to `github.com/thoredee/timebacklab-website`
2. Click the file, then the pencil icon
3. Edit and commit to `main` — Cloudflare Pages auto-deploys in ~60 seconds

**Larger edits across multiple files:**
- Press `.` on the GitHub repo to open GitHub.dev (VS Code in the browser)
- Edit, commit, push — same auto-deploy

**Local editing:**
- Open the folder in VS Code, edit, `git push origin main`

## Adding new pages

The code is now the source of truth — do not re-export the homepage from Claude Designer (it will overwrite live fixes). For new pages:
1. Design in Claude Designer or describe to Claude Code
2. Implement using the existing nav, `css/style.css` variables, and brand palette
3. Drop any Designer exports into `_handoff/` as reference (gitignored, not deployed)

See `docs/PROGRESS.md` for the full workflow note.
