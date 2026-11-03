# Data notes: what is solid and what is not

Confidence labels: **sourced** (seen in a fetched source), **computed** (calculated from fetched data), **estimated** (our model or guess).

## Release dates
| Release | Value in data | Confidence / caveat |
|---|---|---|
| Ubuntu 27.04 "Tenacious T-Rex" | 2027-04-22; beta 04-01, RC 04-15 | sourced (Ubuntu schedule). endoflife.date did not list it yet. |
| Ubuntu 26.10 "Stonking Stingray" | released 2026-10-15 | sourced |
| Fedora 44 | released 2026-04-28 | sourced: Fedora Bodhi `released_on`, endoflife.date agrees. Was wrongly 2026-05-01 until 2026-11-03 (correction shown on page). |
| Fedora 45 | released 2026-11-03 (flipped by the updater) | sourced: Fedora Bodhi `released_on`. Original forecast (Nov 3-17, 70%) kept under `forecast`. |
| Fedora 46 | window Apr 15-May 15, 2027, 70% | estimated from the 6-month cadence; no official date found |
| Debian 13 | released 2025-08-09 | from general knowledge, not fetched this session |
| Debian 14 "forky" | window Jun 1-Sep 30, 2027, 50%; freeze ~Mar 15, 2027 | estimated; freeze date is a volunteer estimate. Debian 15 is "duke". |
| Linux Mint 27 "Adrien" | window Dec 20, 2026-Jan 31, 2027, 50% | "Christmas 2026" is reported; rename from "Mint 23" to "27" and the codename are from a single source, unverified. Earlier reporting said it would be based on Ubuntu 26.04 LTS with Cinnamon. |
| GNOME 51 | released 2026-09-16 | sourced |
| GNOME 52 | 2027-03-17; alpha 01-09, beta 01-30, RC 02-27 | sourced (GNOME calendar) |
| Linux 7.3 | released 2026-10-18 | sourced |
| Linux 7.4 | window Dec 20-27, 2026, 80% | computed from kernel cadence (2-week merge window + rc7/rc8) |
| Linux 7.5 | window Feb 21-Mar 7, 2027, 55% | computed (7.4 + 9-10 weeks); only 1 evidence item, so noindex |

Added 2026-11-03 (sourced, see `research_notes/release-data/README.md`): KDE Plasma 6.9 on 2027-02-23 (KDE wiki schedule); Firefox every 2 weeks, 160 on 2026-11-10 and 161 on 2026-11-24 (whattrainisitnow.com; Mozilla product-details' NEXT_RELEASE_DATE showed 2026-11-06, which looks like the RC date, so the calendar's date is used); NixOS 26.11 "Zokor" on 2026-11-30 (release managers' GitHub issue, "may still change slightly"); Ubuntu 26.04 LTS, Debian 13, Mint 22.3, NixOS 26.05, Plasma 6.8 and Firefox 159 facts from their release notes.

Still not researched: Thunderbird, LibreOffice, Blender, Godot, Wine, Proton, Mesa, systemd, Python, Node, PHP, Rust, Go, Postgres, Docker, Kubernetes, openSUSE, long-tail distros.

## Usage and traffic numbers (from the research)
- **Flathub** (sourced/computed): 3,754 apps listed, 3,395 had install data. Bands by `installs_total`: 10M+ = 2; 1M-10M = 76; 100k-1M = 485; 10k-100k = 1,475; 1k-10k = 1,176; 100-1k = 164; under 100 = 17. Median about 15k. `installs_total` totals 417M versus a 4.96B headline, so it probably counts new installs only (undocumented).
- **Debian popcon** (computed): 226,478 package names, 296,020 submissions. Bands: 100k+ = 1,279; 30k-100k = 1,922; 10k-30k = 2,501; 1k-10k = 9,666; 100-1k = 23,373; 10-100 = 45,883; under 10 = 141,854. Most of these are libraries, not products people search for.
- **Snap Store** about 8,805 listings (approximate, no install counts public). **AppImage** about 3,348 apps (no usage data). **Repology** tracks 335,425 projects. DistroWatch blocked automated access; 958 distros listed, about 274 active (Linux Magazine, early 2024).
- **Wikipedia pageviews** (computed, 130 Linux/FOSS articles, Oct 2025-Sep 2026): under 1k = 0, 1k-10k = 69, 10k-100k = 58, 100k+ = 3 (Telegram, Nginx, Android; none Linux-specific). Sample is skewed to notable projects. Leaders: Firefox 91k, Ubuntu 42k, Linux kernel 37k, Debian 35k, Mint 30k, SteamOS 28k, Arch 27k, Blender 27k, Fedora 26k.
- **Desktop share:** Steam survey Linux about 4.0% (July 2026; record 5.33% March 2026). StatCounter June 2026 4.36%; an August report of 7%+ is unconfirmed.
- **Estimated search buckets** for "X release date" queries (estimated, plus or minus 50%, built from an assumed 1-10% release-date share of Wikipedia views): 100k+ = 0; 10k-100k about 5; 1k-10k about 35; 100-1k about 350; 10-100 about 2,000; under 10 the remaining thousands. Roughly 15-25 projects above 5,000 searches/month. **No real keyword-tool data was available.**

## SERP / competition (hypotheses, not measured)
No live Google results were captured. For "Ubuntu 26.10" queries web search returned OMG Ubuntu, Linux Journal, forum reposts and third-party pages (one with stale status). "Fedora 46 release date" and "Linux 7.4 release date" returned nothing with a firm date. "Linux Mint 23 release date" is stale because of the rename. Hypothesis: weakest results are Fedora 46, Linux 7.x, Debian 14, Mint 27 and long-tail distros. Incumbent tracker: endoflife.date (EOL/support oriented, little forward-looking milestone content).

## Updater feeds (all fetched successfully 2026-11-03)
| Feed | Gives | Caveat |
|---|---|---|
| https://www.kernel.org/releases.json | mainline rc and final dates | once 7.x.1 exists, mainline date is gone; endoflife.date fills in |
| https://changelogs.ubuntu.com/meta-release | Ubuntu versions and dates | lags: 26.10 not listed yet on 2026-11-03 |
| https://bodhi.fedoraproject.org/releases/ | Fedora `released_on`, pending versions | slow (can take 20s+); some old entries have no date |
| https://deb.debian.org/debian/dists/stable/Release | stable codename/version | date only usable for x.0 |
| GNOME gitlab gnome-shell tags API | alpha/beta/rc/x.0 tags | tag date is 1-2 days before the official release, so not used as the release date |
| http://packages.linuxmint.com/dists/ | Mint codenames | no versions or dates |
| https://endoflife.date/api/{linux,ubuntu,fedora,debian,linuxmint}.json | release dates | aggregator, lags new releases; no GNOME feed (404) |
