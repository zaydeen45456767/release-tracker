// Short, project-specific "how to get it" guides. Each links to the project's own documentation,
// which stays the authority; commands are the long-standing, documented ones.

export function guideFor(family, title, version) {
  switch (family.id) {
    case 'ubuntu':
      return {
        install: `Download the ${title} ISO from Ubuntu's release server, write it to a USB stick (Ubuntu's Startup Disk Creator or balenaEtcher both work) and boot your computer from it.`,
        upgrade: [
          'Open Software Updater. When a new release is available for your system, it offers the upgrade.',
          'Or run this in a terminal:',
        ],
        code: 'sudo do-release-upgrade',
        note: 'People on an LTS release are offered the next LTS once its first point release (.1) is out.',
      };
    case 'fedora':
      return {
        install: `Download Fedora Workstation and write it to a USB stick with Fedora Media Writer, then boot from it.`,
        upgrade: [
          'GNOME Software shows a banner when a new Fedora version is ready to install.',
          `On the command line, update first, then download ${title} and reboot into the upgrade:`,
        ],
        code: `sudo dnf upgrade --refresh\nsudo dnf system-upgrade download --releasever=${version}\nsudo dnf system-upgrade reboot`,
        note: "Check Fedora's upgrade guide before you start; it lists anything special for each release.",
      };
    case 'debian':
      return {
        install: 'Download the small "netinst" installer from debian.org, write it to a USB stick and boot from it; it fetches the rest during installation.',
        upgrade: [
          'Read the upgrade chapter of the release notes first. In short: fully update your current system, change the release codename in your APT sources to the new one, then run:',
        ],
        code: 'sudo apt update\nsudo apt full-upgrade',
        note: 'Debian only supports upgrading from the previous stable release.',
      };
    case 'linux-mint':
      return {
        install: 'Pick an edition (Cinnamon, MATE or Xfce) on linuxmint.com, write the ISO to a USB stick and boot from it.',
        upgrade: [
          'Point releases in the same series (for example 22.2 to 22.3) are offered in the Update Manager under Edit.',
          'Moves to a new series (for example 21.x to 22) use the mintupgrade tool described in the Linux Mint documentation.',
        ],
        note: 'Make a system snapshot with Timeshift before upgrading.',
      };
    case 'gnome':
      return {
        install: `${title} is not installed on its own. You get it with a distribution that ships it, or when your distribution upgrades to it.`,
        upgrade: ['Upgrade your distribution to a version that includes it. Fedora and Ubuntu ship each new GNOME within weeks; others follow later.'],
        note: 'GNOME OS nightly images exist for testing, but they are not meant for everyday use.',
      };
    case 'linux-kernel':
      return {
        install: `Most people never install a kernel by hand: ${title} reaches you through your distribution's updates. Fast-moving distributions get it within weeks; LTS distributions stay on older kernels by design.`,
        upgrade: ['To build it yourself, download the source tarball from kernel.org, configure it and compile it. This is for developers and testers.'],
        note: 'If you need a long-supported kernel, use the current LTS kernel instead of the newest one.',
      };
    case 'kde-plasma':
      return {
        install: `${title} is not installed on its own. Pick a distribution that ships Plasma, such as KDE neon, Fedora KDE Plasma Desktop or Kubuntu.`,
        upgrade: ['New Plasma versions arrive through your distribution: within days on KDE neon, Fedora and rolling distributions, and with the next release on Ubuntu-based ones.'],
        note: 'If you need fewer changes, the Plasma 6.6 LTS series gets bug fixes until 2029.',
      };
    case 'nixos':
      return {
        install: 'Download the graphical installer from nixos.org, write it to a USB stick and boot from it; the installer writes your first configuration.',
        upgrade: ['Switch the nixos channel (or your flake input) to the new release, then rebuild:'],
        code: `sudo nix-channel --add https://nixos.org/channels/nixos-${version} nixos
sudo nixos-rebuild switch --upgrade`,
        note: 'Read the release notes first: each release lists options that were renamed or removed.',
      };
    case 'firefox':
      return {
        install: 'Most distributions include Firefox. You can also get it from mozilla.org, as a Flatpak from Flathub, or as a Snap on Ubuntu.',
        upgrade: ["Firefox updates itself or through your distribution's updates. To check, open the menu, then Help, then About Firefox."],
        note: 'Organisations that want fewer changes can use Firefox ESR instead.',
      };
    default:
      return null;
  }
}
