# Linux software universe: size and popularity distribution (as of 2 Nov 2026)

Labels: [SOURCED] = fetched directly from the named source on 2026-11-02; [COMPUTED] = I computed it from raw data pulled from that source; [ESTIMATED] = my inference or an older figure. Raw data files are in the scratchpad (flathub per-app JSON, popcon all-popcon-results, AppImage feed).

## 1. App counts and install distribution: Flathub, Snap Store, AppImage

### Takeaway
Flathub has about 3,400 apps with a public per-app install counter, and the distribution is a steep long tail: 78 apps above 1M installs, about 56% of apps below 100k, and the top 100 apps hold about 59% of all installs. Snap Store has about 8,800 listings but publishes no public per-snap install counts. The AppImage catalog (appimage.github.io, the successor to AppImageHub) lists about 3,350 apps and has no usage counts.

### Cited Findings
- Flathub stats endpoint reports 3,754 apps ("number_of_apps"), 2,216 verified apps, and 4,959,608,922 cumulative "downloads" (this counts updates as well as new installs) — [Flathub stats API](https://flathub.org/api/v2/stats) [SOURCED]
- Flathub appstream endpoint lists 3,395 app IDs (the desktop-app subset I could iterate) — [Flathub appstream API](https://flathub.org/api/v2/appstream) [SOURCED]
- Per-app stats are public at `https://flathub.org/api/v2/stats/{app_id}` (fields: installs_total, installs_per_day). Examples: Firefox 12,510,830 installs; Chrome 12,399,981; Discord 9,205,728; Brave 6,881,199; Spotify 6,498,009; VLC 6,221,503; Telegram 5,796,855; RetroArch 5,693,881; Steam 5,671,114; Dolphin 5,600,086; Bottles 5,487,019 — [Flathub per-app API, e.g. Firefox](https://flathub.org/api/v2/stats/org.mozilla.firefox) [SOURCED]
- I fetched installs_total for all 3,395 IDs (0 failures). Sum of installs_total is 417,098,347 [COMPUTED from the Flathub per-app API]. Note this is far below the 4.96B headline "downloads", so installs_total appears to count new installs only, not updates; the exact definition is not documented in what I read [ESTIMATED reading].
- Flathub installs_total bands, 3,395 apps [COMPUTED]:
  - 10M or more: 2 (Firefox, Chrome)
  - 1M to 10M: 76 (so more than 1M installs: 78 apps, 2.3%)
  - 100k to 1M: 485 (14.3%)
  - 10k to 100k: 1,475 (43.4%)
  - 1k to 10k: 1,176 (34.6%)
  - 100 to 1k: 164 (4.8%)
  - under 100: 17 (0.5%)
  - Median app: about 14,988 total installs. Sub-100k total: 2,832 apps = 83%. Under 10k: 1,357 apps = 40%.
  - Concentration: top 10 apps = 18.3% of installs; top 1% (33 apps) = 38.6%; top 100 = 58.7%; top 10% (339 apps) = 79.2% [COMPUTED]
- Flathub category counts (apps per primary category): Game 745, AudioVideo 371, Network 334, Development 267, Office 257, Graphics 227, Education 175 — [Flathub stats API](https://flathub.org/api/v2/stats) [SOURCED]
- Flathub daily downloads series runs 2018-04-29 to 2026-11-02 (the last day is partial) — [Flathub stats API](https://flathub.org/api/v2/stats) [SOURCED]
- Snap Store: the legacy search API reports 8,805 results at size=1 (page count), i.e. about 8,805 snaps in the default (stable, public) search — [Snap Store search API](https://api.snapcraft.io/api/v1/snaps/search?size=1) [SOURCED, but the default filters, architecture and channel are not documented; treat as approximate]
- Snap response fields include ratings_average, version, publisher, etc. but no download or install counter. Install metrics exist only for publishers via `snapcraft metrics`, the web dashboard and monthly emails, which only list released snaps with more than 10 users — [popey, Snapcraft metrics](https://blog.popey.com/2023/10/snapcraft-metrics/) [SOURCED]
- Canonical post dated 25 Aug 2026 reports a 59% rise in installed snaps and a 40% rise in devices running snaps over the prior 60 days (secondary, from a search snippet; not verified against the page) — [Canonical/Ubuntu blog results](https://ubuntu.com/blog/snapistics-snaps-in-numbers?format=md) [SOURCED via search snippet only]
- AppImage catalog (appimage.github.io feed) contains 3,348 items — [AppImage feed.json](https://appimage.github.io/feed.json) [SOURCED]
- Older AppImageHub figures: 918 AppImages (circa 2021) and 1,289+ (circa 2020s article) — [Kubuntu forums](https://www.kubuntuforums.net/forum/general/community-cafe/72399-appimage-supplier-bintray-going-down-may-1st), [desdelinux](https://blog.desdelinux.net/en/appimagepool/) [SOURCED, dated]
- Mixed catalog caveat: a Reddit post cites 2,050 apps for the AppImage page; the third-party AM / portable-linux-apps catalog is a different list — [r/AppImage](https://redlib.belloworld.it/r/AppImage) [SOURCED, low reliability]

### Inferences
- Flathub installs follow roughly a log-normal long tail: the median app has about 15k installs, and apps with more than 100k installs are only about 16.5% of the catalog (563 of 3,395), but they carry roughly 90% of installs [ESTIMATED from computed bands; I computed the 563 count, the 90% is my rough read, not directly computed].
- Snap likely has a similar or steeper tail (many single-publisher, abandoned or auto-built snaps), but there is no public data to test it [ESTIMATED].

### Gaps
- No public Snap Store install counts per snap, so no Snap band distribution. snapcraft.io pages do not show them in the data I could access.
- Snap total of 8,805 is from one API call with unspecified filters; no official total found.
- No usage counts exist for AppImage; only catalog size. AppImageHub's own current count could not be fetched.
- Flathub installs_total vs "downloads" definition not confirmed from docs.

## 2. Debian/Ubuntu package counts and Debian popcon distribution

### Takeaway
Debian popcon (296,020 submissions) tracks 226,478 distinct package names, but only about 6,000 have 10k or more installs and about 144k are under 10 installs (largely noise). The top 1,000 packages carry 47% of all installs, and the top 10,000 carry 96%.

### Cited Findings
- popcon total submissions: 296,080 per the all-popcon-results file; 296,020 on the qa.debian.org page. 288,328 are amd64 — [popcon all-popcon-results](https://popcon.debian.org/all-popcon-results.txt.gz), [qa.debian.org popcon](https://qa.debian.org/popcon.php?package=firefox-esr) [SOURCED]
- Packages listed in popcon: 226,478 distinct names [COMPUTED from all-popcon-results]
- "Inst" (installed = vote + old + recent + no-files) bands out of 226,478 packages [COMPUTED]:
  - 100k or more: 1,279
  - 30k to 100k: 1,922
  - 10k to 30k: 2,501
  - 1k to 10k: 9,666
  - 100 to 1k: 23,373
  - 10 to 100: 45,883
  - under 10: 141,854
  - Median package: 4 installs. The 1,000th package has 125,525 installs; the 5,000th has 13,677; the 10,000th has 2,678.
  - Top 1,000 = 46.9% of total install counts; top 10,000 = 95.6% [COMPUTED]
- "Vote" (used regularly) bands: 100k or more 480; 30k to 100k 783; 10k to 30k 1,004; 1k to 10k 3,724; 100 to 1k 8,548; 10 to 100 18,158; under 10 193,781 [COMPUTED]
- Debian reference manual: 78,072 packages for amd64 across all areas (main 76,587; contrib 362; non-free 1,045; non-free-firmware 78); release not specified on the page — [Debian Reference ch02](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html) [SOURCED]

### Inferences
- The 226k popcon names far exceed the roughly 78k archive packages because popcon includes removed, third-party, source-built and renamed packages; the under-10 bucket is mostly such noise [ESTIMATED].
- Popcon is opt-in, skewed to Debian/Ubuntu desktops and servers with the daemon installed, and measures installs, not use [ESTIMATED].

### Gaps
- Ubuntu package count not fetched (packages.ubuntu.com unreached); Ubuntu's archive is commonly cited in the ~60-70k binary-package range, unverified here [ESTIMATED, unsourced].
- Ubuntu's own popcon (popcon.ubuntu.com) not fetched.

## 3. Repology

### Takeaway
Repology tracks 335,425 projects and about 5.0M packages across 200+ repositories. I could not compute the many-repos band distribution because bulk API responses were too large/truncated.

### Cited Findings
- "Total projects known to repology: 335425"; 5,014,952 individual packages — [Repology repository statistics](https://repology.org/repositories/statistics) [SOURCED]
- The repository list shows roughly 210+ repositories (page was truncated, exact count not read) — [Repology repository statistics](https://repology.org/repositories/statistics) [SOURCED, approximate]
- The Repology API supports a `repos=N-` filter (projects present in at least N repos) — [Repology API](https://repology.org/api/v1/projects/?repos=20-) [SOURCED]
- Ratio: 5.01M packages / 335k projects = about 15 packages per project on average [COMPUTED]. Note repos include non-Linux ones (scoop, CRAN, Hackage, nix variants) so counts are not Linux-only.

### Inferences
- With a mean of about 15 packages per project and a heavy tail of single-repo projects, the many-repo (popular) segment is likely a small fraction of 335k [ESTIMATED; no band data].

### Gaps
- No count of projects present in 2+, 5+, 10+, 20+ repos: paging the API was attempted, but responses (tens of MB per page for large filters) truncated; needs the Repology database dump or the web UI's per-filter counts.

## 4. DistroWatch

### Takeaway
DistroWatch lists about 958 distributions in its database, of which about 274 were active in early 2024; the live site blocked automated fetches, so no current page-hit band distribution was obtained.

### Cited Findings
- 958 distributions listed and 274 still active (early 2024) — [Linux Magazine, "Digging into DistroWatch", issue 280](https://www.linux-magazine.com/Issues/2024/280/Digging-into-DistroWatch) [SOURCED, 2024]
- Alternate undated forum figure: 283 active, 832 total — [Linux Foundation forum](https://forum.linuxfoundation.org/discussion/169783/download-sites) [SOURCED via search snippet, undated, low reliability]
- Historical: 275 active in 2020, 285 active in 2014 — [Linux Magazine, "State of the distros"](https://www.linux-magazine.com/Issues/2021/243/Trend-Watcher) [SOURCED]
- Of the Top 10 in page-hit ranking, eight stayed the same since 2021; Zorin and openSUSE entered, Garuda and elementary OS dropped — [Linux Magazine](https://www.linux-magazine.com/Issues/2024/280/Digging-into-DistroWatch) [SOURCED]
- DistroWatch itself states rankings do not correlate with usage or quality — [Tecmint summary](https://www.tecmint.com/top-most-popular-linux-distributions/) [SOURCED via search snippet]

### Inferences
- The active-distro count has been flat at roughly 275-285 for a decade, so the distro universe is a stable few hundred with a short head [ESTIMATED from sourced points].

### Gaps
- DistroWatch returned HTTP 403 to automated fetching (dwres.php, weekly.php, major); I did not attempt to bypass it. No current HPD ranking, so no hit-band distribution. The user can export the table manually from distrowatch.com/dwres.php?resource=popularity.
- 2026 totals for listed/active distros not found.

## 5. Desktop environments, window managers, tools, game launchers

### Takeaway
The DE/WM/launcher layer is small in count (dozens of notable projects) but its GitHub footprint shows a long tail of hobby projects; Hyprland is the star leader among compositors.

### Cited Findings (GitHub API, queried 2026-11-02) [SOURCED]
- Stars: Hyprland 39,809; sway 17,476; Heroic Games Launcher 12,571; Lutris 10,350; Bottles 9,044 — [GitHub API](https://api.github.com/repos/hyprwm/Hyprland), [Heroic](https://api.github.com/repos/Heroic-Games-Launcher/HeroicGamesLauncher), [Lutris](https://api.github.com/repos/lutris/lutris), [Bottles](https://api.github.com/repos/bottlesdevs/Bottles), [sway](https://api.github.com/repos/swaywm/sway)
- GNOME/gnome-shell (974 stars) and KDE/plasma-desktop (1,387) on GitHub are mirrors; the real development is on GNOME GitLab and KDE Invent, so stars understate popularity — [GitHub API](https://api.github.com/repos/GNOME/gnome-shell) (mirror status is my knowledge, [ESTIMATED])
- GitHub topic repository counts: window-manager 1,975; tiling-window-manager 756; wayland-compositor 286; desktop-environment 914; linux-distribution 689; game-launcher 576 — [GitHub search API](https://api.github.com/search/repositories?q=topic:window-manager) [SOURCED; topic tags are self-applied and include non-Linux and duplicates]

### Inferences
- Counting "notable, maintained" DEs is a few dozen, WMs/compositors a few hundred; topic counts overestimate because of tag noise and abandoned repos [ESTIMATED].
- Flathub's Game category (745 apps) and Bottles at 5.5M Flathub installs show launcher/compat tooling sits near the head of Flathub's distribution [COMPUTED/SOURCED above].

### Gaps
- No authoritative count of DEs/WMs (e.g. from Arch Wiki lists) fetched; no install-based popularity for DE/WM.
- Install numbers for Heroic and Lutris on Flathub were not individually pulled, though the raw per-app JSON is available in the scratchpad.
