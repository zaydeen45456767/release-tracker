# Search demand for Linux software release/version queries

Date of research: 2026-11-03. Data window for Wikipedia measurements: Oct 2025 - Sep 2026 (12 full months), en.wikipedia, all-access, user agent only. Raw scripts/results were kept in the session scratchpad (pv.py, pv.json).

## What monthly volumes do "release date / new version / download" queries show in Ahrefs/Semrush/Trends?

### Takeaway
I could not obtain any verifiable Ahrefs/Semrush/Google Keyword Planner/Trends volume for the specific queries named (ubuntu 26.04 release date, fedora release date, etc.); those tools are paywalled/JS-only and web search returned none. Only proxies (Wikipedia pageviews) are measured; any keyword-volume numbers in a final report would be extrapolation.

### Cited Findings
- Web searches for volume of "ubuntu 26.04 release date" and Google Trends for "ubuntu 26.04" returned only news/release-schedule pages and no volume data; the search tool itself states it found no search-volume data — [OMG Ubuntu schedule](https://www.omgubuntu.co.uk/2025/11/ubuntu-26-04-release-schedule)
- Ubuntu 26.04 LTS release notes are dated 23 April 2026 (event the query would spike around) — [Ubuntu release notes](https://documentation.ubuntu.com/release-notes/26.04/)
- A Semrush snapshot of ubuntu.com lists "ubuntu download" among its top organic keywords, with a possible volume of ~110,000, but the snippet text was garbled and unconfirmed — [Semrush ubuntu.com overview](https://semrush.com/website/ubuntu.com/overview). Treat as UNVERIFIED.
- Volume tools disagree widely for the same keyword (example: Google Ads 880k vs Semrush 590k vs Ahrefs 100k for one query) — [Practical Ecommerce](https://www.practicalecommerce.com/keyword-volume-google-vs-semrush-vs-ahrefs)
- MEASURED proxy, Wikipedia "version history"/release-list pages (the articles people land on for "what's the latest version / release date" queries), monthly views, Jan 2025-Sep 2026 via [Wikimedia pageviews API](https://wikimedia.org/api/rest_v1/):
  - Ubuntu_version_history: ~18k-35k/month (Oct 2025 35,055; Apr 2026 31,491; Sep 2026 18,100)
  - Linux_kernel_version_history: ~20k-31k/month (Apr 2026 31,277)
  - Fedora_Linux_release_history: ~4.6k-9.3k/month; peaks Apr 2025 (9,254) and Apr 2026 (9,035) and Oct 2025 (7,765)
  - Firefox_version_history: ~6.7k-10.8k/month, flat
  - Linux_Mint_version_history: ~170-380/month
  - Debian_version_history: 22k-35k/month through Nov 2025, then dropped to 8.4k (Dec 2025) and ~1.9k (Sep 2026) - almost certainly a title/redirect change (page likely moved), so not a real demand drop; Debian_13 article took ~400-750/month. UNCERTAIN, cause not verified.
  - Ubuntu_26.04_LTS: article essentially a redirect (7-108 views), so not usable.

### Inferences
- Version-history pages for Ubuntu and the kernel pull ~20-30k Wikipedia visits/month and are strongly seasonal (April/October for Ubuntu, Fedora). Google search volume for the matching queries is probably the same order of magnitude or higher for big distros, but this is an extrapolation, not measured.
- Mint's version-history page at only ~250/month vs Ubuntu's ~27k (a ~100x gap) suggests release-intent demand for second-tier distros is 2 orders of magnitude below Ubuntu/kernel.

### Gaps
- No actual Ahrefs/Semrush/Keyword Planner/Trends numbers for any of the 10 named queries. Recommendation: pull from Ahrefs Keywords Explorer / Google Keyword Planner / Trends manually.
- Wikipedia version-history pages are not the same as search queries (many users arrive via Google, so they are a lower bound of Google demand for informational version queries but exclude users served by the SERP answer box, official sites and AI answers).

## Wikipedia pageviews as a proxy: bucket counts across Linux software

### Takeaway
Across 130 Linux/FOSS-related English Wikipedia articles (after removing redirects), 0 are under 1k/month, 69 (53%) are 1k-10k, 58 (45%) are 10k-100k, and 3 (2%) are over 100k; median 8,597/month. Top 10 articles hold 41% of total views, top 20 hold 55%. The list is selection-biased toward notable projects, so the real long tail below 1k is under-represented.

### Cited Findings
Methodology (MEASURED): For each article I pulled monthly all-access/user views from the Wikimedia REST API (en.wikipedia, 2025-10-01 to 2026-09-30) and took the 12-month mean. I started with 140 titles across distros, DE/WMs, apps and tools. Titles with implausibly low views that turned out to be redirects (Handbrake, Fedora_Silverblue, Ardour, Pantheon, Weston, Libinput, Pacman_(package_manager), Chrome_OS, Zsh, GRUB, Cosmic, Coreutils, qBittorrent, Clear_Linux, Enlightenment_(software), Bazzite, Thunderbird, Wayland_(display_server_protocol), Signal_(messaging_app)) were dropped or replaced with canonical titles (ChromeOS 24,125; Z_shell 6,360; GNU_GRUB 5,464; COSMIC_(desktop_environment) 4,087; GNU_Core_Utilities 4,707; QBittorrent 10,743; Clear_Linux_OS 1,593; Enlightenment_(window_manager) 2,167; Bazzite_(operating_system) 13,049). Redirect handling was by manual judgement, so a few mislabels are possible. Result: 130 articles. Source: [Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/).

Bucket counts (12-mo mean monthly views): <1k: 0 | 1k-10k: 69 | 10k-100k: 58 | 100k+: 3 (Telegram 241k, Nginx 164k, Android 110k - none are Linux-desktop-specific). Pure Linux-focused 100k+ count is 0; the highest Linux-specific pages are Firefox ~91k, Ubuntu ~42k, Linux kernel ~37k, Debian ~35k, Linux Mint ~30k.

Selected measured means (monthly, Oct 2025-Sep 2026): Firefox 90.6k; Steam 65.7k; Ubuntu 42.1k; Linux_kernel 37.2k; VS Code 36.9k; Debian 34.9k; Linux_Mint 30.0k; LibreOffice 29.7k; SteamOS 28.1k; Arch 26.8k; Blender 26.6k; Fedora_Linux 25.9k; ChromeOS 24.1k; Inkscape 18.6k; NixOS 17.8k; GNOME 17.2k; RHEL 16.4k; GIMP 16.3k; OBS 16.3k; Kali 14.9k; openSUSE 14.5k; Pop!_OS 13.3k; KDE_Plasma 12.5k; Gentoo 12.4k; Xfce 11.5k; Zen_Browser 11.3k; Cinnamon 11.0k; Krita 10.9k; Rocky 7.8k; Manjaro 7.4k; Flatpak 7.1k; Void 6.8k; AlmaLinux 6.5k; EndeavourOS 5.5k; Elementary OS 5.0k; Hyprland 4.5k; Kdenlive 4.1k; MATE 3.7k; Darktable 2.9k; Sway 2.8k; Lutris 2.8k; PipeWire 2.3k; Solus 2.4k; Mageia 2.2k; Linux_Lite 1.9k; Window_Maker 1.6k.

### Inferences
- Distribution is roughly log-normal centered near ~8-9k/month; the top ~15% of projects (Firefox, Ubuntu, kernel, Debian, Mint, Arch, Fedora, Blender, LibreOffice, SteamOS) account for a large share of attention, but there is no single dominant outlier among Linux-specific pages.
- Wikipedia views for a project are a very rough proxy of brand-search interest; a project's release-intent search volume is some small fraction of that (see ratio section) and is likely 1-2 orders smaller for 1k-10k tier projects, meaning most tier-3 projects have per-query release-date demand in the tens-to-hundreds per month. This is extrapolation.
- Tiers for modelling: tier A (>=25k: Ubuntu, kernel, Debian, Mint, Arch, Fedora, Firefox, Blender, SteamOS, LibreOffice, VS Code) ~11 pages; tier B (10k-25k) ~30 pages; tier C (1k-10k) 69 pages.

### Gaps
- Sample is selection-biased (I picked notable projects); true population of Linux software (thousands of packages) would have most items under 1k/month. No sample of obscure projects was measured.
- Wikipedia is English only and drops mobile app/AI-answer traffic dynamics; no Google Search Console data.

## Ratio of release-intent queries to brand queries (SEO studies)

### Takeaway
I found no published study giving the share of brand searches that are "release date"/"new version" intent for software. General long-tail distribution data exist (Ahrefs, Backlinko) but are not modifier-specific.

### Cited Findings
- Ahrefs: keywords with fewer than 10 monthly searches are almost 93% of its US keyword database (2.3 billion keywords); just under 18,000 keywords (17,730) exceed 100k/month; ~15% of daily Google searches are never-before-seen — [Ahrefs long-tail guide](https://ahrefs.com/blog/long-tail-keywords/)
- Backlinko (306M US keywords): 91.8% of terms are long tail, where long tail = 1-100 searches/month; long tails make up a small part of total demand (a "3.3%" figure circulating in secondary writeups could not be verified) — [Backlinko](https://backlinko.com/google-keyword-study)
- My search for a release-date-modifier share study returned nothing; SparkToro's Search Modifiers tool exists but gives no such figure — [SparkToro](https://sparktoro.com/blog/new-search-modifiers-in-sparktoro-v2-make-it-easy-to-analyze-your-audiences-search-intent/)

### Inferences
- Software "<name> release date" queries with tiny volume sit in the <10-100/month long tail for nearly all projects below the top ~20. Typical release-intent share of brand queries for software is plausibly single-digit percent to ~10-15% in release windows, but that is an assumption, not sourced; label as extrapolation.
- A cross-check using measured data: Ubuntu_version_history (~27k) / Ubuntu article (~42k) = ~0.65; Fedora_Linux_release_history (~6k) / Fedora_Linux (~26k) = ~0.23; Firefox_version_history (~8.4k) / Firefox (~91k) = ~0.09; Linux_Mint_version_history (~250) / Linux_Mint (~30k) = ~0.008. These are Wikipedia ratios (not search ratios), spanning ~1% to ~65%, showing the release/version share varies by two orders of magnitude between projects.

### Gaps
- No primary study on modifier share; recommend pulling Ahrefs "Matching terms" for "ubuntu" and filtering on release/version/download.

## Which software have release-intent spikes around releases?

### Takeaway
Measured spikes: Ubuntu and Fedora version-history pages peak in April and October; SteamOS and Steam hardware spiked around Valve's Nov 2025 announcements; Hyprland, Zen Browser, Proton, Vim show one-off peaks.

### Cited Findings
- Ubuntu_version_history: Oct 2025 35,055 (vs ~26-29k baseline), Apr 2026 31,491 — Wikimedia API (above)
- Fedora_Linux_release_history: Apr 2025 9,254; Oct 2025 7,765; Apr 2026 9,035 vs ~4.6-6.5k baseline — Wikimedia API
- SteamOS article: Nov 2025 75,676 vs ~19-25k baseline (about 3x); Steam_Machine article 24/month in Oct 2025 -> 1,189 (Nov) -> 12,941 (Dec) -> 46,691 (Jan 2026), peak 60,151 in Jun 2026; Steam_Frame 31k in Nov 2025 and 44.5k in Sep 2026 — Wikimedia API
- Other one-off peaks (12-month max vs mean): Hyprland max 11.5k in Sep 2026 vs mean 4.5k; Zen_Browser max 24.0k Jun 2026 vs mean 11.3k; Proton_(software) max 36.2k Nov 2025 vs mean 17.3k; Vim max 44.8k Jan 2026 vs mean 18.4k; COSMIC desktop max 11.7k Oct 2025 vs mean 4.1k (COSMIC alpha/stable timing); Blender decline from 60-66k (Jan, Mar 2025) to ~25k — Wikimedia API
- Debian_13 article rose from ~25-114/month to 754 in Oct 2025 (months after Debian 13 Trixie's Aug 2025 release; cause of lag unverified) — Wikimedia API
- Ubuntu 26.04 LTS shipped 23 April 2026 — [Ubuntu release notes](https://documentation.ubuntu.com/release-notes/26.04/)

### Inferences
- Spiky classes: (1) fixed-cadence distros (Ubuntu Apr/Oct, Fedora Apr/Oct, Mint ~Jul/Dec, Debian multi-year), (2) hardware/announcement-driven (SteamOS/Steam Machine), (3) hyped new projects (COSMIC, Hyprland, Zen). The kernel and Firefox are flat (continuous cadence), so their release-intent demand is steady rather than spiky.
- Wikipedia monthly granularity understates day-level spikes; daily data were not pulled.

### Gaps
- No daily data or Google Trends curves retrieved; no confirmation of 9to5linux/OMG Ubuntu traffic numbers (not searched successfully within the tool budget).
- Mint 23, GNOME 50, Plasma 6.x, kernel 7.0 specific query volumes unavailable.
