# Release predictability and SERP weakness for "X release date" queries (Linux software), as of 2026-11-03

Labels: [CONFIRMED] = official or clearly sourced scheduled date; [PREDICTED] = my extrapolation from cadence (not sourced as a date); [UNVERIFIED] = single/weak source or conflicting reports. Research was limited (about 18 tool calls). Many projects in the assignment list were NOT checked; see Gaps.

## Which projects publish schedules, and what are the next dates and cadence?

### Takeaway
The distro and desktop majors (Ubuntu, Fedora, GNOME, kernel, Firefox, Mint) have clear cadences, and several next dates are already published. Debian, KDE and the long tail (Pop!_OS COSMIC, Zorin, Manjaro, etc.) were not verified or are irregular. Most key dates are available for the Nov 2026 - end 2027 window.

### Cited Findings
**Ubuntu**
- Ubuntu 26.10 "Stonking Stingray" is listed as released 15 Oct 2026 (interim), with support ending 1 Jul 2027 [CONFIRMED, per endoflife.date] — [endoflife.date/ubuntu](https://endoflife.date/ubuntu)
- Ubuntu 26.04 LTS "Resolute Raccoon" released 23 Apr 2026; LTS every 2 years in April, interims every 6 months — [endoflife.date/ubuntu](https://endoflife.date/ubuntu)
- Ubuntu 27.04 "Tenacious T-Rex": release scheduled 22 Apr 2027; beta 1 Apr 2027; RC 15 Apr 2027; development opened 30 Oct 2026; supported to Jan 2028 [CONFIRMED schedule, secondary reporting of Canonical's schedule] — [LinuxToday](https://www.linuxtoday.com/blog/ubuntu-27-04-tenacious-t-rex-is-slated-for-release-on-april-22nd-2027/), [Phoronix](https://www.phoronix.com/news/Ubuntu-27.04-Opens-For-Dev), [OMG Ubuntu](https://www.omgubuntu.co.uk/2026/10/ubuntu-2704-opens-for-development)
- Ubuntu 22.04 LTS standard support ends 1 Jun 2027 (tracker-relevant "end of life" date) — [endoflife.date/ubuntu](https://endoflife.date/ubuntu)

**Fedora**
- Fedora 45 beta shipped 15 Sep 2026. Final target of 20 Oct 2026 was a NO-GO, slipped to 27 Oct, and one later article says release confirmed for 3 Nov 2026 (today). The reports conflict; I could not reach the official schedule [UNVERIFIED which date it actually shipped] — [Linuxiac](https://linuxiac.com/?p=221276), [Phoronix](https://phoronix.com/news/Fedora-45-First-No-Go), [warp2search Final GO](https://www.warp2search.net/story/fedora-linux-45-final-release-is-go-everything-you-need-to-know/)
- Fedora 46: no official date found. A GitLab release-notes milestone has an April 13, 2027 expiry; spring (Apr-May) 2027 is the usual window [PREDICTED] — [Fedora docs milestone](https://gitlab.com/fedora/docs/fedora-linux-documentation/release-notes/-/milestones/8)
- Cadence: roughly every 6 months (Apr/Oct), frequently slips by 1-2 weeks via Go/No-Go (F44 and F45 both delayed) — same sources as above. This slip pattern is itself an SEO opportunity (date changes weekly).

**Debian**
- Debian 14 "forky": expected roughly mid-2027; a list poster guessed a transition/toolchain freeze around 2027-03-15 (a volunteer estimate, not official) [PREDICTED/UNVERIFIED]. Debian 15 is codenamed "Duke". — [Linuxiac](https://linuxiac.com/debian-13-freeze-begins-in-march-debian-15-codename-revealed/), [Debian-user list](https://lists.debian.org/debian-user/2025/09/msg00397.html)
- Cadence: about every 2 years, with date announced late, so "Debian 14 release date" is a high-uncertainty query.

**Linux Mint**
- Mint's next release is targeted for Christmas 2026 (Dec 2026) on Ubuntu 26.04 base. It was previously called Mint 23 and has been renamed Linux Mint 27 "Adrien" (new scheme: version = year, boys' names, once-a-year releases; Mint 28 follows). Article dated 14 Oct 2026 [UNVERIFIED exact date; Dec 2026 target per press] — [It's FOSS](https://itsfoss.com/news/linux-mint-27-announced.md), [OMG Ubuntu](https://www.omgubuntu.co.uk/2026/04/linux-mint-next-release-christmas-2026/amp), [LinuxConfig](https://linuxconfig.org/linux-mint-23-release-date-and-new-features)
- Gap/opportunity: old queries "Linux Mint 23 release date" are now stale (name changed), and many pages still say "23". Multiple naming variants create query fragmentation.

**GNOME**
- GNOME 50 released 2026-03-18; GNOME 51 released 2026-09-16; GNOME 52: alpha 2027-01-09, beta 2027-01-30, RC 2027-02-27, final tarballs 2027-03-13, release 2027-03-17 [CONFIRMED] — [release.gnome.org/calendar](https://release.gnome.org/calendar/)
- Cadence: every 6 months (Mar/Sep). GNOME 53 expected Sep 2027 [PREDICTED].

**KDE Plasma**
- Plasma 6.8 is shown as the latest release on kde.org; the page gave no date or forward schedule — [kde.org/plasma-desktop](https://kde.org/plasma-desktop/). Plasma's cadence is not verified in this research (my background knowledge: ~3 feature releases/year plus bugfix releases; treat as [PREDICTED], unsourced). Plasma 6.9/7.0 timing not found.

**Linux kernel**
- Latest: 7.3 released 18 Oct 2026; 7.2 on 16 Aug 2026; LTS series 6.18 (30 Nov 2025, supported to 31 Dec 2028), 6.12, 6.6 and 6.1 (to 31 Dec 2027), 5.15 and 5.10 (end 31 Dec 2026) [CONFIRMED] — [endoflife.date/linux](https://endoflife.date/linux)
- Cadence: a new mainline kernel every 9-10 weeks — [endoflife.date/linux](https://endoflife.date/linux)
- Derived: 7.4 ≈ 20-27 Dec 2026 (18 Oct + 9-10 weeks = 20 Dec to 27 Dec), could slip into early Jan because of the holidays [PREDICTED]; 7.5 ≈ late Feb/Mar 2027; 7.6 ≈ May 2027; 7.7 ≈ Jul/Aug 2027; 7.8 ≈ Oct 2027 [PREDICTED]. The search found no sourced 7.4 date. A new LTS is conventionally the last release of the year (6.18 was Nov 2025), so the 2026 LTS candidate is likely 7.4 [PREDICTED].
- Kernel version numbering: 7.0 released April 2026 — [Neowin](https://www.neowin.net/amp/linux-70-arrives-as-linus-torvalds-embraces-a-new-era-of-ai-driven-kernel-development/)

**Firefox**
- Cadence is in flux: one report says Mozilla planned a two-week major release cycle from Sep 2026, reaching Firefox 164 on 26 Jan 2027, with no guarantee beyond that; a Mozilla release-management post describes 4-week cycles with weekly dot releases starting around Firefox 151. Reports conflict [UNVERIFIED]. Official calendar: whattrainisitnow.com/calendar (not fetched) — [IT-Connect](https://www.it-connect.tech/firefox-to-ship-major-releases-every-two-weeks-starting-in-september/), [Windows Report](https://windowsreport.com/firefox-could-move-to-a-two-week-release-cycle-in-september-2026/), [Mozilla firefox-dev](https://groups.google.com/a/mozilla.org/g/firefox-dev/c/_ruCNCevX3g), [endoflife.date/firefox](https://endoflife.date/firefox)
- Firefox ESR 115 extended for Win 7-8.1 / macOS 10.12-10.14 to March 2027, to be reconsidered Feb 2027 — [Mozilla Support Releases](https://wiki.mozilla.org/Support:Releases)

### Inferences
- Not researched directly (no fetched sources; from general knowledge, flag as [PREDICTED/unsourced]): openSUSE Leap (annual-ish, Leap 16.x), Thunderbird (monthly, follows Firefox), LibreOffice (Feb/Aug, 26.2 / 26.8 / 27.2 naming), Blender (3-4 per year, LTS each year), Godot (irregular), Wine (dev biweekly, stable annual ~Jan), Mesa (quarterly), systemd (irregular ~6 months), Python (October annually: 3.15 expected Oct 2026, 3.16 Oct 2027, PEP-scheduled), Node (even-numbered LTS in April, October), PHP (annual November/December), Rust (6 weeks, fixed), Go (Feb/Aug), PostgreSQL (annual Sep/Oct, minor quarterly), Kubernetes (3 per year), Docker (irregular), Elementary OS, Pop!_OS COSMIC, Zorin, MX, Manjaro, EndeavourOS, Kali (quarterly: yyyy.1-4), Tails (4-weekly aligned to Firefox ESR), Nobara/Bazzite (follow Fedora), CachyOS (rolling with monthly ISOs). Python 3.15 and several others may already be out as of Nov 2026; those need checking.
- Rust (6-week train) and Kali (quarterly) are the most mathematically predictable; Debian, Mint (older), Godot, Docker, systemd and Pop!_OS are the least.
- Distros that rebase on Ubuntu/Fedora (Mint, Zorin, Pop!_OS, elementary, Nobara, Bazzite) inherit predictable base dates but their own dates are lagged and uncertain, which means more search-intent ambiguity and potentially weaker competition.

### Gaps
- No official/sourced dates were gathered for: Fedora 46, KDE Plasma next releases, Firefox full 2027 calendar, Thunderbird, LibreOffice, Blender, Godot, Wine, Proton, Mesa, systemd, Python, Node, PHP, Rust, Go, Postgres, Docker, Kubernetes, Elementary, COSMIC, Zorin, MX, Manjaro, EndeavourOS, Kali, Tails, Nobara, Bazzite, CachyOS, openSUSE. Fetching endoflife.date product pages (e.g. endoflife.date/python, /nodejs, /php, /kubernetes, /postgresql, /rust, /go, /libreoffice, /blender, /kali-linux?) is the fastest way to complete.
- Fedora 45 actual ship date unresolved (27 Oct vs 3 Nov conflict).
- Fedora/Ubuntu wiki schedule pages returned 404 or an Anubis block.

## How many distinct projects have a predictable cadence (by category)?

### Takeaway
No count was sourced. A rough, unsourced estimate from the assignment list: roughly 40-60 projects across categories have some predictable cadence; about 15-20 have fixed published schedules (Ubuntu, Fedora, GNOME, kernel, Firefox, Thunderbird, Rust, Python, Node, PHP, Go, Kubernetes, LibreOffice, Postgres, Kali). Treat as [PREDICTED].

### Cited Findings
- endoflife.date tracks a broad catalogue of products with release/EOL dates (so it is a ready checklist of categories) — [endoflife.date](https://endoflife.date/ubuntu) (page structure observed; total product count not verified here)

### Inferences (rough category tallies from the assignment's list, unsourced)
- Distros: ~15 (Ubuntu + flavors, Fedora, Debian, Mint, openSUSE, elementary, Pop!_OS, Zorin, MX, Manjaro, EndeavourOS, Kali, Tails, Nobara, Bazzite, CachyOS). Fixed-schedule: Ubuntu, Fedora, Kali, Tails; semi: Mint, Debian, Zorin.
- Desktop environments: ~4-5 (GNOME fixed, KDE Plasma semi-fixed, COSMIC, Xfce, Cinnamon).
- Languages/runtimes: ~6-7 (Python, Node, PHP, Rust, Go, Java, Ruby) with the strongest schedules in the set.
- Creative apps: ~4-5 (Blender, LibreOffice, GIMP, Krita, Godot).
- Gaming layers: ~3-4 (Wine, Proton, Mesa, DXVK) mostly irregular.
- Dev tools/server: ~8-10 (Postgres, Docker, Kubernetes, systemd, MySQL, nginx, Linux kernel).

### Gaps
- No authoritative count; endoflife.date's product count not retrieved.

## What ranks for ~15 "X release date" queries? Is the SERP weak? Where is competition lowest?

### Takeaway
I did not run SERP checks for the 15 sample queries, so I cannot honestly state rankings. The only SERP-adjacent evidence: the search results for date queries returned a mix of news outlets (OMG Ubuntu, Phoronix, Linuxiac, LinuxToday), aggregator/scraper sites (warp2search, linux.org threads reposting news, ubuntu.fan), and sometimes stale pages.

### Cited Findings
- For "Ubuntu 26.10 release date codename", results were OMG Ubuntu, Linux Journal, linux.org forum reposts, ubuntupit, ubuntuhandbook, webpronews, ossmalta, ubuntu.fan (a third-party "Download, Release Date & New Features" page with a stale status note dated 4 Oct) — [search results above; e.g. ubuntu.fan](https://ubuntu.fan/en/docs/ubuntu-26-10)
- For "Linux Mint 23 release date": results included linuxconfig, serverspace.io blog, linuxvox, OMG Ubuntu and aggregators; one article calls the date speculative and the name has since changed to Mint 27 — [LinuxConfig](https://linuxconfig.org/linux-mint-23-release-date-and-new-features), [It's FOSS](https://itsfoss.com/news/linux-mint-27-announced.md)
- For "Fedora 46 release date": no result with a firm date; top results were old Fedora pages and a GitLab milestone, showing very thin coverage — search above
- For "Linux 7.4 kernel release date": results were only older kernel news (7.0/7.1); no page answering the query — search above
- For "Debian 14 forky release date freeze": Tom's Hardware, Phoronix, Linuxiac, mailing list posts, with thin firm info — search above

### Inferences
- Weak-SERP signals: Fedora 46, Linux 7.4/7.5, Debian 14, Mint 27 / 23 (name drift), KDE Plasma 6.9/7.0 and Fedora delay queries show thin or outdated pages. Strong-SERP likely: Ubuntu LTS queries, Python/Node/PHP (official pages + endoflife + Wikipedia), Firefox (official wiki), Kubernetes.
- Lowest competition (hypothesis): rolling/niche distros with irregular dates (Pop!_OS COSMIC, Zorin, Nobara, Bazzite, CachyOS), kernel point versions, future-version queries ("Ubuntu 28.04", "Fedora 47") where only generic pages exist.

### Gaps
- Actual SERP positions for the 15 queries (official/Wikipedia/9to5linux/Phoronix/Reddit) not captured; needs live Google checks, since WebSearch is not a Google SERP.

## Existing release-date trackers and their traffic

### Takeaway
endoflife.date is the established tracker and it is clean and API-based, but it is oriented to EOL/support rather than "next release date". No SimilarWeb numbers were found for any tracker.

### Cited Findings
- endoflife.date carries per-product pages with release dates, support/EOL dates, and cadence notes (e.g. kernel page states a 9-10 week mainline cadence, and Ubuntu page says upcoming 27.04 not yet listed as of its fetch) — [endoflife.date/linux](https://endoflife.date/linux), [endoflife.date/ubuntu](https://endoflife.date/ubuntu). Note: Ubuntu page did not list 27.04 despite the dev cycle having opened on 30 Oct, so upcoming-release coverage lags, which is a gap.
- Search for SimilarWeb data on endoflife.date returned nothing relevant — [search attempt](https://developers.similarweb.com/reference/visits)

### Inferences
- Gap vs. endoflife.date: it lists released versions, not forward-looking "next release date" pages with schedule milestones (beta/RC), slip history or countdowns. Also not human-oriented for flavour/derivative distros.

### Gaps
- Not examined: releasealert.dev, distrowatch.com, release calendars (e.g., GitHub-release trackers), Wikipedia "release history" pages. No SimilarWeb estimates found for any of them. A direct look at similarweb.com/website/endoflife.date and distrowatch.com is needed (free data often blocked by fetch tools).
