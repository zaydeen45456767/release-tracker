# How the site runs (simple version)

## Where the data lives
Plain files inside the project. No database is needed yet.
- `site/src/data/releases.json`: every project, release page, forecast, evidence item, highlight and edition.
- `site/src/data/history.json`: version history and support dates (refreshed by the updater).
- `site/updater/log.json`: what each updater run changed, what needs the owner's review, which feeds failed.
- `research_notes/`: raw research and every URL we checked.

## What we need, and why
| Thing | Needed? | Why |
|---|---|---|
| **GitHub** (free) | Yes, next | Keeps the code and data safe with full history, and runs the daily job (GitHub Actions). |
| **Cloudflare Pages** (free) | Yes, when going live | Hosts the website and rebuilds it every time the data changes. Also handles the domain. |
| **Domain** (about $10/year) | Yes, when going live | The site's address. |
| **Google Search Console** | Yes, when going live | Shows searches and clicks; used to request indexing for new pages. Owner adds the site and verifies it; for automatic weekly reports, the owner adds a read-only Google service account as a user (no password sharing). |
| **Alerts** | Built in | The daily job opens a GitHub issue when the review list, the changes or the link check have something new; GitHub emails it to the owner. Telegram can be added later. |
| **Cloudflare D1** (database) | Not yet | Only for the future marketplace (accounts, listings, click counts) or a much larger site. Files in GitHub are simpler, free and every change is reviewable. |

## The automatic workflow (no daily input from the owner)
Runs on GitHub every 3 hours, and every hour while a release is 2 days before to 3 days after its date (`site/updater/watch.js` decides). The outside-link check runs once a day.
1. **Read** about 16 official feeds (kernel.org, Fedora, Ubuntu, Debian, GNOME, KDE, NixOS, Mozilla product details, Mozilla's release calendar, GNOME's release calendar, KDE's Plasma schedule, Linux Mint, endoflife.date).
2. **Flip** a page to "released" the moment an official feed shows it, keeping the forecast as first published.
3. **Create pages** (marked `auto: true`, capped at 5 per run):
   - Firefox: a `scheduled` page for each of the next 3 versions on Mozilla's own calendar; moved dates and milestones are applied and the first date is kept (`firstPublished`).
   - Linux kernel: a `predicted` page when a release candidate appears (window = week after the last rc, never before rc7); the window moves with each extra rc.
   - Fedora, GNOME: a `predicted` page (usual six-month gap) when the project already shows the next version in development.
   - GNOME and KDE Plasma: their own schedule pages keep our scheduled dates in sync (a slip such as Plasma 6.9.0 moving from 18 to 23 Feb is applied automatically).
   - Any family: a `released` page when a feed shows a newer version released with a real date in the last 120 days.
   - Other projects (Ubuntu, Debian, Mint, NixOS, KDE) have no early feed: the owner is alerted and a session adds the page.
4. **Keep text honest:** an older page's "is the current version" sentence is rewritten once a newer release is out (an LTS stays "the current LTS" when only a normal release follows).
5. **Links:** each version's download address is computed from the project's patterns and the newest version always points at the project's own download page; release-notes links are added only after the project's server answers them; the daily link check opens a GitHub issue if anything breaks.
6. **Test, build, save** (nothing is saved if tests fail). Cloudflare publishes in about a minute. **IndexNow** tells Bing and others about the change.
7. **Alert** (GitHub issue, emailed) whenever pages were created or changed, something needs review, a feed failed or a link broke. Nothing new means no issue.

Google itself cannot be pinged by a script for ordinary pages (its Indexing API is only for job and livestream pages). Its signals are the sitemap (real `lastmod`) and Search Console's "Request indexing" (about 10 a day). Every run therefore writes `site/updater/index-queue.json`: indexable pages in the order to request them (forecasts first, soonest date first, then released pages). A session with Search Console open (Claude in Chrome) inspects the queue from the top, skips what is already on Google and requests the rest. Bing and others are pinged automatically (IndexNow).

## New pages (weekly)
1. The updater (or the priority list in `docs/PRIORITY.md`) shows which new versions are coming.
2. A Claude session researches each one from official sources and adds it to the data, with sources.
3. The owner reviews the weekly batch (about 7-10 pages, never a flood).
4. After publishing, the owner clicks "Request indexing" in Search Console for the top pages.

## Weekly report
Search Console numbers (impressions, clicks, indexed pages), pages added, forecasts graded, open review items, posted as a GitHub issue.

## Status today
Code side is ready: local git repo, `.github/workflows/daily.yml` (daily job + alerts) and `ci.yml` (tests on every push). Missing: the owner's GitHub repo, Cloudflare Pages, domain, Search Console and Bing. Step-by-step: `docs/SETUP.md`.
