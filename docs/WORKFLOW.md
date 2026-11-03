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

## The daily workflow (once set up)
1. **Every morning** a GitHub Action runs the updater. It reads about 15 official feeds (kernel.org, Fedora, Ubuntu, Debian, GNOME, KDE, NixOS, Mozilla, Linux Mint, endoflife.date).
2. It **applies safe changes only**: marks a release as out when an official feed shows it, adds new betas/rcs to the evidence, refreshes version history and support dates.
3. It **runs the tests**. If anything fails, nothing is published.
4. It **saves the changed data** to GitHub. Cloudflare Pages rebuilds and publishes the site in about a minute.
5. It **pings search engines** (IndexNow) for the pages that changed.
6. It **checks every outside link** (`npm run check-links`).
7. It **alerts the owner** with a GitHub issue (emailed by GitHub) when there is something new: what flipped, new versions seen, items to review, failed feeds, broken links. Nothing new means no issue.

## New pages (weekly)
1. The updater (or the priority list in `docs/PRIORITY.md`) shows which new versions are coming.
2. A Claude session researches each one from official sources and adds it to the data, with sources.
3. The owner reviews the weekly batch (about 7-10 pages, never a flood).
4. After publishing, the owner clicks "Request indexing" in Search Console for the top pages.

## Weekly report
Search Console numbers (impressions, clicks, indexed pages), pages added, forecasts graded, open review items, posted as a GitHub issue.

## Status today
Code side is ready: local git repo, `.github/workflows/daily.yml` (daily job + alerts) and `ci.yml` (tests on every push). Missing: the owner's GitHub repo, Cloudflare Pages, domain, Search Console and Bing. Step-by-step: `docs/SETUP.md`.
