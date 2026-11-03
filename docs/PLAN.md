# System plan (full logic)

Goal: be among the first good pages for every upcoming Linux release, rank for its name, and turn the same page into the launch page when it ships.

## 1. Data sources
- **Official:** each project's schedule page, release notes, git tags, mailing lists, GitHub releases API, official stores.
- **Aggregators:** endoflife.date (support/EOL dates, check it lags new releases), DistroWatch (blocks bots), Repology (package versions).
- **News as early signal:** 9to5Linux, Phoronix, OMG Ubuntu. Leaks matter less than for gadgets, since most Linux releases run on public schedules.
- Every source gets a weight (how often a mention turned out true) and a typical lead time. Not built yet.

## 2. Forecasting
- Per family keep the release history and the gaps between versions.
- Forecast = last release + typical gap, with a window and a chance %.
- **Scheduled** releases (project published the date) show status `scheduled`, no percentage. Use chance % only for unscheduled `predicted` ones.
- Kernel rule: after rc7 the final usually lands the next Sunday; rc8 adds a week. Merge window is 2 weeks; cadence 9-10 weeks.
- Windows move on evidence: a project's dated statement wins; two independent reports agreeing move it; a new ID or codename appearing in code pulls it earlier.
- A passed date moves into the remaining window; nonsense dates are blocked; a forecast with no release 30 days after its window closes becomes `missed` (kept, not withdrawn).
- Implemented today: `effectiveStatus`, `headline`, `isIndexable` in `site/src/lib/forecast.js`. Not implemented: evidence-driven window moves, source weights, history-based gap calculation (windows are currently typed into the data file).

## 3. Pages (URL never changes)
- **Forecast page** `/[family]/[slug]/`: date or window, status, chance, key dates, evidence timeline, "waiting for X? use Y now" link, sources, FAQ (FAQPage JSON-LD), clear "not announced" note. Built.
- **Early page:** for a brand-new name, published when a trusted source names it. One strong signal from the project itself is enough; rumours need two independent sources. Not built.
- **Launch flip:** when proof appears in an official source, the same page becomes the launch page (facts, links), keeping all content so ranking is kept. Built: the updater flips it and keeps the forecast under `forecast`.
- **Hub pages** `/[family]/`: built. **Home** with "Next 30 days": built. **Track record** `/track-record/`: built (shows 0 graded; do not show an accuracy score until there are enough graded results).
- **Catalog** (existing products from data feeds) and **alternatives pages** ("free alternative to X"): not built; keep `noindex` until real content; only build alternatives after keyword data shows demand.
- **Fast lane:** a new product with early traction gets a page the same day, capped per day. Not built.
- Extra page ideas for repeat searches around releases: "X vs Y", end-of-life dates, "what's new in X".

## 4. The flip (automation)
Built: the daily updater (GitHub Actions, 06:00 UTC) flips releases from official feeds, the site rebuilds on Cloudflare Pages, and the owner gets a GitHub-issue alert. Not built: faster polling near launch day.

## 5. Scale without looking like spam
- Launch with 30-40 quality pages. Add 1-3/day (or a reviewed weekly batch of 7-10).
- Daily caps on new pages created and on pages offered to Google; both ramp on a calendar (for example +5/week) to a hard cap. All page-creating steps share the same counters, with tests. Not built.
- Thin pages stay `noindex` and out of the sitemap until they have real content (built: `isIndexable` requires 1+ source, a summary of 40+ characters, and for forecasts 2+ pieces of evidence).
- Sitemaps split by page type (Modelcast and OpenSourceDL both do this); today there is one `/sitemap.xml` listing only indexable pages.

## 6. Running it (decided 2026-11-03; details in `docs/WORKFLOW.md`)
- One GitHub repo is the source of truth; data lives in JSON files (`site/src/data/`). No database until the marketplace needs one (then Cloudflare D1).
- GitHub Actions: `ci.yml` tests every push; `daily.yml` runs the updater, tests, builds, checks links, commits data and opens an alert issue when something is new.
- Cloudflare Pages builds and hosts the static site on every push. (The earlier idea of Cloudflare Workers + D1 cron was dropped as more complex than needed.)
- Search engine pings: **IndexNow** (Bing/Yandex). Google dropped sitemap ping in 2023 and its Indexing API is only for job/livestream pages, so for Google use the sitemap plus a manual Search Console "request indexing" for important pages.

## 7. Honesty and error catching
- Daily self-check reads the live site and database and emails the owner on known mistake types; weekly audit compares every upcoming page to its sources; each new mistake gets a new check and a test.
- Every change is tested, deployed, and checked on the live site including a phone-sized screen.

## 8. Measurement
Search Console (impressions, clicks, indexed pages), anonymous analytics (where visitors go/scroll/tap), weekly report as a repo issue.

## 9. Page-count plan (from the research report)
- **Wave 1 (30-40 pages):** Fedora 46/47, kernel 7.4-7.8, Debian 14/15, Mint 27/28, Ubuntu 27.04 and later, GNOME 52/53, KDE Plasma.
- **Wave 2 (30-40):** derivative distros (Zorin, Pop!_OS/COSMIC, Nobara, Bazzite, CachyOS, openSUSE, Arch-based).
- **Wave 3 (30-40):** apps on regular release trains (Firefox, LibreOffice, Blender, Godot, Wine/Proton, Mesa, systemd, languages/runtimes).
- About 100-150 pages in total. The roughly 2,000 projects in the 10-100 searches/month tier only via an automated template, after wave 1 shows traction.
