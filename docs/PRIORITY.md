# What to publish and index first (as of 2026-11-03)

Goal: about 1 lakh (100,000) visits a month. Release-date searches spike in the weeks before a release, so a page must be live and indexed early. Order below = expected search demand x how soon it peaks. Volumes are estimates until the owner checks Keyword Planner / Search Console.

## Upcoming versions likely to "boom" (forecast pages)
| # | Release | Peak | Page | Why |
|---|---|---|---|---|
| 1 | Firefox 160, 161 (then every 2 weeks) | 10 Nov, 24 Nov 2026 | built | Huge audience; Mozilla publishes dates months ahead. Add each new version as soon as the calendar lists it. |
| 2 | NixOS 26.11 "Zokor" | 30 Nov 2026 | built | Fixed date, imminent. |
| 3 | Linux kernel 7.4 | 20-27 Dec 2026 | built | Weekly rc news; we update after every rc. |
| 4 | Linux Mint 27 "Adrien" | Dec 2026-Jan 2027 | built | Rename from "23" causes confusion and extra searches; page should answer "Linux Mint 23 release date" too. |
| 5 | Kali Linux 2026.4 | Dec 2026 | to do | Quarterly releases (YYYY.1-4), high search volume. No endoflife.date feed; needs its own source. |
| 6 | Rocky Linux / AlmaLinux 10.3 | Nov-Dec 2026 | to do | Enterprise users search minor versions; both follow RHEL. |
| 7 | KDE Plasma 6.9 | 23 Feb 2027 | built | Published KDE schedule. |
| 8 | GNOME 52 | 17 Mar 2027 | built | Published calendar. |
| 9 | Ubuntu 27.04, Fedora 46 | Apr-May 2027 | built | Twice-yearly spikes. |
| 10 | Pop!_OS 26.04 (COSMIC) | 2027? | to do | High interest; no date yet, so a careful forecast page. |
| 11 | Debian 14 "forky" | mid/late 2027 | built | Big release every two years; publish news on freezes. |
| 12 | Ubuntu 28.04 LTS | Apr 2028 | later | Biggest Ubuntu searches; create the page the day the codename is announced (around Oct 2027). |

## Steady traffic ("normal" pages for released versions)
Latest-version and download searches never stop: Ubuntu 26.04 LTS, Debian 13, Linux Mint 22.3, Fedora 45, Firefox and Firefox ESR, KDE Plasma 6.6 LTS, Linux 6.18 LTS. Next to add (all have endoflife.date data): openSUSE Leap 16, Rocky Linux, AlmaLinux, SteamOS, Proxmox VE, then apps (LibreOffice, Blender, Thunderbird, GIMP, VLC, OBS) and developer tools (Python, Node.js, PHP, Go, Rust, PostgreSQL, Docker, Kubernetes).

## How we try to be first
1. **Spot the name early.** The daily updater reports any new version or codename it sees in official feeds ("New: Fedora 47 seen in Bodhi"). A page draft is made the same day.
2. **Publish weeks ahead.** Big releases: as soon as the name exists. Others: at least 4-8 weeks before the expected date. Pages stay `noindex` until they have real content (2+ pieces of evidence and a source).
3. **Get indexed fast.**
   - Sitemap lists every page with its real last-changed date (`lastmod`), so search engines recrawl changed pages.
   - Owner: in Search Console, use URL Inspection, then "Request indexing" for each new priority page (Google allows about 10 a day per property).
   - IndexNow ping to Bing/Yandex on every publish (to build once the site is hosted).
   - New pages appear on the home page ("Coming next") and their project page the same day, so crawlers find them through internal links.
4. **Keep it fresh.** Every beta, rc, freeze or slip goes into the page's evidence log the day it happens; that keeps it ahead of stale pages.
5. **Flip on launch day.** The same URL becomes the release page with the real date and downloads, so it keeps its ranking.
6. **Mentions.** Owner shares notable updates (slips, new dates) where Linux users talk; links help new domains get crawled and trusted.

## Indexing order (owner decision, 2026-11-04)
Request indexing for **upcoming/forecast pages only** first, soonest peak first (about 10 a day in Search Console). When every indexable forecast page has been requested, move on to the released/stable pages beneath them. New content: forecast pages first.
