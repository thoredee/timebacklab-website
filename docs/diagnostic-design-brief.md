# Timeback Diagnostic — Design Brief

This note is meant to accompany the "Technical Specification: The Timeback Diagnostic" doc when briefing Claude Design. That spec describes the product logic; this note describes what to actually design vs. what's already handled in code.

## What's being built, in plain terms

This is **not** a Tally/Typeform-style form embed. It's a custom-built interactive quiz living natively on the Timeback Lab website (same repo/stack as the homepage). One page, one JS-driven experience, that:
1. Asks 2 "gating" questions to determine the user's persona
2. Shows 10 scored questions (content varies by persona, but the *format* is identical every time)
3. Instantly calculates a score and shows a personalized results screen

Because it's custom-built rather than a form-builder embed, there's full design freedom — this should look and feel like a first-class part of the site, not an embedded widget with someone else's chrome around it.

## Design's job vs. what's already handled

**Design this:** the visual look of a small number of reusable screens/components (below).
**Not design's problem:** persona routing logic, scoring math, which question bank shows, data storage, submission. That's all built in code on top of the visual designs. No need to worry about "how does it know which question to show" — just design what a question *looks like*, and it gets reused ~10-40 times with different text/state.

## Screens/components to design

Think of this as **5 reusable templates**, not dozens of individual page designs:

1. **Quiz shell** — the persistent frame around every step: progress indicator (step X of 12), back/next controls. Should feel like a continuation of the site's existing nav, not a separate app chrome.

2. **Gating question screen** (1 template, used twice) — a single question with 2–4 large selectable cards. These two questions set context before scoring starts, so they can feel slightly more "welcome/intro" in tone than the scored questions.

3. **Scored question screen** (1 template, reused 10x per person) — this is the workhorse screen. Question text at top, then exactly **4 selectable options** representing the "Perception of Time Scale" (Heavy Friction → Zero Friction). Needs states for: unselected, hover, selected. Design it knowing the question text length will vary (some questions are one line, some are two).

4. **Results screen** (1 template, 4 content variants) — needs to display:
   - A score/percentage (0–100%), ideally with some visual meter/gauge treatment
   - A labelled "#1 Time Leak" callout (one of 4 category names)
   - A headline + short narrative + prescription paragraph (length varies per tier — design for the longest one)
   - One CTA button

   Design all 4 tiers as **color/tone variants of the same layout** (e.g., Tier 1 "Trapped" more urgent, Tier 4 "Driver's Seat" more confident) — don't design 4 unrelated layouts, since one component renders all 4 with a different data set.

5. **Mobile versions** of all of the above, at the site's existing breakpoints (980px / 640px).

## Design constraints to work within

- **Reuse the existing brand system** — don't invent new colors/type. Pull from the palette and type scale already established on the homepage (Volt, Purple, Yellow, Cyan, Magenta, etc. — see the brand palette table in `CLAUDE.md`) and reuse existing button/card styling patterns where they fit.
- **Content will vary in length** — question text, option labels, and result copy are all dynamic. Design components that flex gracefully with a short *and* a long version of the text, rather than pixel-perfect fixed-length copy.
- **No login/gating screens needed** — company ID association happens invisibly via URL parameter, not a visible form field. No "enter your company code" screen needed.
- **This is one continuous flow**, not separate pages — design it as states/steps within one experience (like a step-by-step wizard), not as 14 standalone webpages with their own headers/footers.

## Handoff format

Same as the homepage: export as a design bundle to drop into `_handoff/` and extract markup/CSS from. Name each frame/screen clearly by its role (e.g., "Gating Q1", "Scored Question — default state", "Results — Tier 1 Trapped") so it's unambiguous which screen is which when it gets wired up.

## Technical architecture (for reference, not design's concern)

- **Front end:** native HTML/CSS/JS on the existing Cloudflare Pages site — quiz logic (persona routing, scoring, tier selection) implemented client-side for instant results, no external form tool.
- **Storage:** responses posted to a Google Apps Script Web App endpoint, which appends rows to a Google Sheet (free, gives immediate raw-data access).
- **Reporting:** the respondent's result is rendered instantly client-side (no external report tool in that path). Google Looker Studio, connected to the same Sheet, is used only as an internal/owner-facing aggregate dashboard — not shown to respondents.
- **Cost:** all components are free-tier; no subscriptions.
