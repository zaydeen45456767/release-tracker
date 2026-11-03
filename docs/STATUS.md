# Status (as of 2026-11-03)

## Where we are in one line
**Live at https://onlinux.site** (Cloudflare Pages, repo `zaydeen45456767/release-tracker`, domain at Namecheap with Cloudflare DNS, launched 2026-11-03). Daily job and CI run on GitHub; IndexNow key file is live and the daily job pings Bing when data changes. Next: owner adds the site to Search Console, then we grow content in weekly batches.

## What exists
- **Projects (9):** Ubuntu, Fedora, Debian, Linux Mint, NixOS (distributions); GNOME, KDE Plasma (desktops); Linux kernel; Firefox (apps).
- **Release pages (22):** released: Ubuntu 26.10, Ubuntu 26.04 LTS, Fedora 45, Fedora 44, Debian 13, Linux Mint 22.3, NixOS 26.05, GNOME 51, KDE Plasma 6.8, Linux 7.3, Firefox 159. Upcoming: Firefox 160 (scheduled 10 Nov 2026), Firefox 161 (24 Nov), NixOS 26.11 "Zokor" (30 Nov), Linux 7.4 (predicted 20-27 Dec), Linux Mint 27 "Adrien" (predicted Dec-Jan), Linux 7.5 (predicted, noindex: thin), KDE Plasma 6.9 (23 Feb 2027), GNOME 52 (17 Mar 2027), Ubuntu 27.04 (22 Apr 2027), Fedora 46 (predicted Apr-May 2027), Debian 14 "forky" (predicted Jun-Sep 2027).
- **35 built pages** (also project pages, home, track record, about, 404), 30 passing tests, 133 outside links all working.
- **Home:** "New: X is out" pill, headline, animated search with penguin, "Next up" line, two drifting release rows, "Out now" and "Coming next" side by side (same rows, filter: Distributions / Desktops / Kernel / Apps), editions grid, "How we forecast" (6 source types), FAQ answered from data.
- **Release pages:** icon + title, date card with status, official Download button (real download page via `primaryDownload`), "Can't wait? Use the latest stable" box on forecasts, key facts, sourced "What's new" highlights, kept forecast + grade after a flip, timeline (previous version, release, latest update, today, next version, end of support; or milestones for upcoming), "Why this window?" (average gap), evidence log, install/upgrade guide, editions (newest stable only), all-versions table (support, gap, Download / Files / Notes links), project FAQ + page FAQ, About sidebar. Structured data: FAQPage, BreadcrumbList, SoftwareApplication.
- **Project pages:** latest stable + next release boxes, editions and flavors (own icons and official links), upcoming list, timeline, all-versions table, FAQ.
- **Updater:** 15 feeds (kernel.org, Ubuntu meta-release, Fedora Bodhi, Debian archive, GNOME GitLab tags, Linux Mint archive, Mozilla product details, endoflife.date for Ubuntu, Fedora, Debian, Mint, kernel, KDE Plasma, NixOS, Firefox). Auto-applies only safe changes (flip to released with sourced date, keep forecast, move "use now", add rc/beta evidence, refresh history). Everything else goes to the owner review list.
- **Automation ready, not running:** `.github/workflows/daily.yml` and `ci.yml`; alerts are GitHub issues (emailed by GitHub) only when something new happens.

## Decisions made (do not reopen without the owner)
- White minimal design, one blue accent, icons everywhere, no dark theme, no multi-colour.
- Scope: software that runs on Linux; forecasts plus stable downloads; marketplace later.
- Data in JSON files in git; GitHub Actions + Cloudflare Pages; no database (D1) until the marketplace.
- Fedora 44 date corrected to 28 Apr 2026 (owner approved), correction note shown on the page.

## Waiting on the owner
1. **Search Console:** Domain property for onlinux.site (TXT record in Cloudflare DNS), submit `sitemap.xml`, then "Request indexing" for priority pages (about 10 a day). Then Bing Webmaster (import from Search Console).
2. **Keyword check:** about 15 queries in Google Keyword Planner.
3. **Contact email** for corrections (About page).
4. Optional: Cloudflare Web Analytics; GitHub "Watch, All activity" so alerts are emailed.

## Next for Claude
- Done: brand Onlinux, IndexNow (`site/updater/indexnow.js`, key file in `site/public`).
- To do: social preview image; privacy page if analytics is on; run the daily job once; check the live site on desktop and phone; Search Console weekly report via read-only service account.
- Content (see `docs/PRIORITY.md`): Kali Linux 2026.4, Rocky Linux / AlmaLinux 10.3, Pop!_OS, openSUSE Leap; Firefox 162+ as the calendar lists them; kernel 7.6; then apps (LibreOffice, Blender, Thunderbird, GIMP, VLC, OBS) and developer tools (Python, Node.js, PHP, Go, Rust, PostgreSQL, Docker, Kubernetes).
- Later features: forecast windows computed from history instead of typed; early-name detection that drafts a page automatically; daily page caps with counters; split sitemaps by page type; more page types per release (end of life, system requirements, "X vs Y").
- Mobile: inner pages have no search box in the header on phones (only the home page).

## Open review items from the updater
- Linux Mint 27: an `adrien/` folder exists in Linux Mint's own package archive, which supports the codename; the number (27 vs 23) is still unconfirmed.

## Known weak data
See `docs/DATA-NOTES.md`. Short version: Mint 27 name from one source; Debian 14 dates are estimates; kernel 7.4/7.5 are our cadence calculations; Fedora 45 highlights come from the beta announcement (Fedora docs block bots); GNOME history is hand-kept (no feed with dates).

## How to run
```bash
cd site && npm install
npm test && npm run build      # tests + site in dist/
npm run update                 # dry run of the updater
npm run update -- --write      # apply safe changes and refresh history
npm run check-links            # check every outside link (after build)
```
