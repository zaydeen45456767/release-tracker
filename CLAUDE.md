# Linux Release Tracker: project context

Read this first, then `docs/STATUS.md` (what is done and what is next) and `docs/PLAN.md` (the full system logic).

## The idea
A website that publishes pages for **upcoming Linux software releases** (distros, desktop environments, the kernel, and later popular apps) and ranks for queries like "fedora 46 release date". We want to be among the first good pages on the web for every upcoming release, then turn the same page into the launch page when the release ships. We cannot guarantee being first, but we try to be one of the first.

**Scope: Linux software only.** Not AI models, not laptops/hardware, not Windows or App Store software. (Early in the conversation this was misread as AI models; the user corrected it.)

## Hard rules
- Never invent dates, specs or facts. Every date is labelled `scheduled` (project published it), `predicted` (our estimate from release cadence), or `released`.
- Never show a release as upcoming if it is out. Never show a date we only noticed on a page.
- Do not mass-publish thin pages. Pages without real content stay `noindex` and out of the sitemap. New pages ramp up on a daily/weekly cap.
- Keep every forecast exactly as first published, so misses stay on a public track record. A forecast whose window closed 30+ days ago with no release becomes `missed` and is kept (never deleted or 404'd).
- Do not deploy, publish, send alerts, or spend money without the user asking.
- Cite only URLs that were actually seen. Label everything sourced, computed or estimated.

## User preferences
- Wants plain language, short answers, and low API/token usage. Do not re-run research that is already in `research_notes/` and `reports/`.
- Said "we dont wanna mass spam": launch with about 30-40 quality pages, then add 1-3 a day (or a weekly batch the user reviews).
- Owner does: backlinks/mentions, manual "request indexing" in Search Console, reviewing weekly numbers. Owner will give Search Console access (use a read-only service account, never a password).
- Goal: about 1 lakh (100,000) visits a month, by growing in waves (distros, apps, developer tools) with several page types per release.

## Where things are
- `site/`: Astro static site (9 projects, 33 pages, 30 passing tests; white minimal design; stable versions with official downloads plus forecasts). `cd site && npm test && npm run build`.
  - `site/src/data/releases.json`: all release data (families + releases). The single source of truth for now.
  - `site/src/data/history.json`: version history and support dates, refreshed by the updater. `site/src/lib/versions.js` (download URL patterns, support, gaps), `site/src/lib/guides.js` (install/upgrade text).
  - `site/src/lib/forecast.js`: pure forecast/status logic (tested in `site/tests/forecast.test.js`).
  - `site/src/lib/data.js`: data helpers. `site/src/layouts/Base.astro`: layout (global CSS, light theme only, header with search, countdown and search scripts).
  - `site/src/components/`: `Icon.astro` (project icons from `simple-icons`), `Search.astro` (animated search), `ReleaseList.astro`, `Line.astro` (timelines). `site/src/lib/look.js`: project colours, status labels, short dates.
  - `site/updater/`: release updater (`npm run update`, add `-- --write` to save). `sources.js` feeds and parsers, `apply.js` rules, `run.js` CLI, `log.json` run history.
  - Pages: home, family hubs `/[family]/`, release pages `/[family]/[slug]/`, `/track-record/`, `/sitemap.xml`, `/robots.txt`.
- `reports/Linux software long tail traffic.md`: the research report (bucketed traffic estimates, recommendation).
- `research_notes/Linux software long tail traffic/`: raw notes (software universe, search demand, release predictability).
- `.claude/launch.json`: preview server config (`site-preview`, port 4321, serves the built `dist/`; run `npm run build` first).
- `docs/PLAN.md`, `docs/STATUS.md`, `docs/DATA-NOTES.md`: handoff docs. `docs/PRIORITY.md`: what to publish/index first. `docs/WORKFLOW.md`: where data lives, accounts needed, daily workflow (GitHub + Cloudflare Pages; no D1 yet).

## Reference sites we studied
- modelcast.site (forecasts for upcoming AI models): our page structure template (forecast to launch flip at one URL, source labels, public track record, "waiting for X? use Y now", sitemaps split by type).
- opensourcedl.online (open-source app download hub): our feed logic template (data from GitHub releases refreshed on build, checksums, "replace paid software" alternatives pages, per-release pages).

- Goal: become a marketplace later; for now every release page has an official Download button (links go only to the project's own servers) and stable versions matter as much as forecasts.
- Design taste: owner wants a white, minimal look like the two reference sites. A dark "departures board" theme was rejected as hard on the eyes. Keep colours to white/grey/ink plus one blue accent; no red or rainbow project colours. Page text should target real searches ("X release date", "next X release", "upcoming Linux releases") and stress that forecasts combine many sources.
