# Release tracker website: project briefing (read first)

Then read `docs/STATUS.md` (what exists, what is next). Deeper docs: `docs/WORKFLOW.md` (how it runs), `docs/SETUP.md` (going live step by step), `docs/PRIORITY.md` (what to publish and index first), `docs/PLAN.md` (system logic), `docs/DATA-NOTES.md` (how solid each fact is).

## The idea
A website with a page for every upcoming and current release of Linux software (distros, desktops, the kernel, apps, developer tools). Upcoming versions get a forecast page ("Fedora 46 release date") that we try to publish and get indexed before anyone else; on release day the same URL flips into the launch page with the real date, what's new and official download links. Stable versions matter as much as forecasts: every released version has an official Download button.
- **Goal:** about 1 lakh (100,000) visits a month, by growing in waves (more projects, several page types per release). Realistic only over 12-18 months.
- **Later:** a marketplace. For now download buttons only link to the project's own site (`rel="nofollow"`, `data-download` attribute for future click counting).
- **Scope: software that runs on Linux.** Not AI models, not hardware, not Windows-only or Mac-only apps. Cross-platform open-source apps and dev tools (Firefox, Python, Docker) are in scope. Ask before widening.

## Name
Brand: **Onlinux**, domain **onlinux.site** (bought at Namecheap 2026-11-03, DNS moving to Cloudflare). Hosted on Cloudflare Pages (`release-tracker-9cv.pages.dev` until the domain is live); GitHub repo `zaydeen45456767/release-tracker` (private). Trademark note: "Linux" is a registered trademark; use it descriptively in text only, never imply official status, keep the owner's own penguin mascot (not Tux) as the brand image.

## Hard rules
- Never invent dates, specs or facts. Every date is labelled `scheduled` (project published it), `predicted` (our estimate) or `released`. Cite only URLs actually fetched; record checked URLs in `research_notes/`.
- Never show a release as upcoming once it is out. Never use a date we only noticed in passing as a release date.
- Keep every forecast exactly as first published (the updater stores it under `forecast` when a release flips). Missed forecasts stay on the track record.
- No thin pages: `isIndexable` keeps pages without 1+ source, a 40+ character summary and (for forecasts) 2+ evidence items out of Google and the sitemap. Grow by quality batches (launch ~30-40 pages, then 1-3 a day or a weekly batch the owner reviews), never a flood.
- Downloads link only to official project sites; we never host files.
- Do not deploy, push, publish, send alerts or spend money unless the owner asks. Never ask for passwords (Search Console access = read-only service account).

## Owner preferences
- Plain, short answers; low API/token use. Do not redo research already in `research_notes/` or `reports/`.
- Design: white and minimal like modelcast.site / opensourcedl.online, but our own. Colours: white, grey, ink and one blue accent only (no red, no rainbow; a dark "departures board" theme was rejected). Every project shows its icon everywhere. Animations stay subtle: animated search (typewriter placeholder, blue spinning ring, penguin mascot peeking over it), two drifting release rows under the search, "Next up" line.
- "Out now" and "Coming next" lists use the same row design (modelcast style).
- Text targets real searches: "X release date", "X download", "latest X version", "next X release", "upcoming Linux releases"; stress that forecasts combine many sources.
- Owner does: buying domain, creating accounts (GitHub, Cloudflare, Search Console, Bing), "Request indexing" for priority pages, mentions/backlinks, Keyword Planner check, weekly review.

## Where things are
- `site/`: Astro 5 static site. `cd site && npm test && npm run build`. Preview: `.claude/launch.json` entry `site-preview` (port 4321, serves `dist/`, build first).
  - Data: `src/data/releases.json` (families with editions, FAQ, downloads; releases with evidence, highlights, specs), `src/data/history.json` (version history and support dates, refreshed by the updater).
  - Logic: `src/lib/forecast.js` (status, headline, indexable, grading), `src/lib/data.js`, `src/lib/versions.js` (history, support, `primaryDownload`, per-version download patterns, timelines), `src/lib/look.js` (icons, status labels, short dates, timeline stations), `src/lib/guides.js` (install/upgrade text).
  - Components: `Search`, `ReleaseList` (shared row design), `VersionTable`, `Editions`, `Line` (timeline), `Icon` (Simple Icons, CC0).
  - Pages: home, `/[family]/`, `/[family]/[slug]/`, `/track-record/`, `/about/`, `404`, `/sitemap.xml` (real per-page lastmod), `/robots.txt`.
  - `updater/`: `npm run update` (dry run) / `npm run update -- --write`. `sources.js` (15 feeds and parsers), `apply.js` (safe-change rules), `history.js`, `run.js` (writes `log.json` and `last-run.md`), `check-links.js` (`npm run check-links`).
  - Tests: `tests/` (forecast, look, updater): 30 passing.
- `.github/workflows/`: `ci.yml` (tests + build on every push), `daily.yml` (06:00 UTC: update, test, build, link check, commit data, GitHub-issue alert when something new).
- Git: `main` is pushed to github.com/zaydeen45456767/release-tracker; Cloudflare Pages deploys every push to https://onlinux.site.
- `research_notes/`: raw research; `release-data/README.md` lists every checked URL and sourced fact. Raw third-party HTML is git-ignored.
- `reports/Linux software long tail traffic.md`: traffic research and estimates.

## How to add a project or release (the usual weekly task)
1. Check `docs/PRIORITY.md` and the updater's review list (`site/updater/last-run.md`).
2. Research from official sources (schedules, release notes, endoflife.date API at `https://endoflife.date/api/<product>.json`); verify every link with curl; note URLs and facts in `research_notes/release-data/README.md`.
3. Add the family (category, cadence, source, download, upgrade, about, editions, faq) and releases (status, date or window+chance, milestones, evidence, sources, summary; for released: type, specs, highlights + highlightsSource, notes) to `releases.json`; add the icon in `look.js`, download pattern in `versions.js`, guide in `guides.js`, feeds in `updater/sources.js`.
4. `npm run update -- --write` (fills history), `npm test`, `npm run build`, `npm run check-links`, check pages in the preview (desktop and phone, no sideways scroll). Update `docs/STATUS.md`.
