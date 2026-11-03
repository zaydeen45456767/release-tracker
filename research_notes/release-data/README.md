# Release data research (2026-11-03)

Raw files in this folder: `eol-*.json` (endoflife.date API), `page-*.html` (official pages, fetched with curl).

## Download and notes URLs checked (HTTP 200 on 2026-11-03)
- Ubuntu: https://ubuntu.com/download/desktop ; per version `https://releases.ubuntu.com/<v>/` (26.10, 26.04, 25.10, 24.04 ok) and `https://old-releases.ubuntu.com/releases/<v>/` for end-of-life ones (25.10, 25.04, 24.10 ok). Notes: https://documentation.ubuntu.com/release-notes/26.10/ and /26.04/.
- Fedora: https://fedoraproject.org/workstation/download ; `https://dl.fedoraproject.org/pub/fedora/linux/releases/<n>/` (45, 44, 43 ok); end-of-life `https://archives.fedoraproject.org/pub/archive/fedora/linux/releases/<n>/` (42, 41 ok). docs.fedoraproject.org blocks bots (Anubis), so Fedora highlights come from https://fedoramagazine.org/announcing-fedora-linux-45-beta/ (beta announcement, labelled as such). Upgrade guide: https://docs.fedoraproject.org/en-US/quick-docs/upgrading-fedora-offline/
- Debian: https://www.debian.org/download ; `https://www.debian.org/releases/<codename>/` (trixie, bookworm, bullseye ok). Announcement: https://www.debian.org/News/2025/20250809 ; notes: https://www.debian.org/releases/trixie/release-notes/
- Linux Mint: https://www.linuxmint.com/download.php ; `https://www.linuxmint.com/rel_<codename>.php` (zena, zara, xia, wilma, virginia ok).
- GNOME: https://www.gnome.org/getting-gnome/ (redirects to gnome.org/#download); notes `https://release.gnome.org/<n>/` (51, 50, 49, 48 ok).
- Kernel: https://www.kernel.org/ ; sources `https://cdn.kernel.org/pub/linux/kernel/v<major>.x/` (v7.x, v6.x ok); changes https://kernelnewbies.org/Linux_7.3
- Failed: discourse "stonking-stingray-release-notes" (404), help.ubuntu.com UpgradeNotes (404), wiki.debian.org (bot challenge).

## Facts used on pages (all from the pages above)
- Ubuntu 26.10: released 15 Oct 2026, supported 9 months until July 2027; GNOME 51; Linux 7.3 (release kernel based on 7.3-rc6); Sequoia PGP (Rust) added to main; official RVA23 RISC-V boards (SpacemiT K3, SiFive BigSky).
- Ubuntu 26.04 LTS "Resolute Raccoon": released 23 Apr 2026; 5 years of updates until April 2031, 10 years with Ubuntu Pro ESM; desktop needs 2 GHz dual-core, 6 GB RAM, 25 GB disk.
- Fedora 45: released 3 Nov 2026 (Bodhi), end of life 8 Dec 2027 (Bodhi). From the beta announcement: kmscon replaces the in-kernel console; package signatures required by default; oo7 for desktop secrets; Python 3.15, Go 1.27, GCC 16.2, glibc 2.44, Podman 6.
- Debian 13 "trixie": released 9 Aug 2025; 5 years of support; GNOME 48, KDE Plasma 6.3, LXQt 2.1.0, Xfce 4.20; 69,830 packages (14,100+ new); 64-bit time_t on all architectures except i386; reproducible-builds progress. endoflife.date: security support until 9 Aug 2028, LTS until 30 Jun 2030.
- Linux Mint 22.3 "Zena": released 11 Jan 2026 (endoflife.date); LTS, supported until April 2029; based on Ubuntu 24.04.
- GNOME 51 "A Coruña" 16 Sep 2026; 50 "Tokyo" 18 Mar 2026; 49 "Brescia" 17 Sep 2025; 48 "Bengaluru" 19 Mar 2025. GNOME 51: smoother frame scheduling, auto-rotate in Settings, Remote Desktop smartcard support, Files drag counter, reduced-motion extended.
- Linux 7.3: released 18 Oct 2026; better VRAM sharing on low-end GPUs; sched_ext cgroup sub-schedulers completed; failfs + fchroot(2) sandboxing; Btrfs/Ext4 speedups; SMB server Time Machine support; faster FUSE io_uring.
