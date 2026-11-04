// The feeds the updater reads. Each parser is pure (feed text in, observations
// out) so it can be tested without the network.
//
// Observation fields:
//   kind: 'release' (version is out), 'prerelease' (rc/alpha/beta tagged),
//         'exists' (version known to the project, not out), 'codename' (name seen)
//   version, codename, label (prerelease name), date (YYYY-MM-DD or null)
//   dateIsRelease: true only when the date is the release day itself, not a tag
//   or point-release date.

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "Thu, 23 April 2026 00:26:04 UTC" or "Released 12 September 2026" -> "2026-04-23"
export function parseTextDate(s) {
  const m = /(\d{1,2}) ([A-Za-z]{3})[A-Za-z]* (\d{4})/.exec(s ?? '');
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  if (month < 0) return null;
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

// Debian-style "Key: value" blocks separated by blank lines.
function parseStanzas(text) {
  return text.split(/\n\s*\n/).map((block) => {
    const fields = {};
    for (const line of block.split('\n')) {
      const m = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
      if (m) fields[m[1]] = m[2].trim();
    }
    return fields;
  });
}

export function parseKernelOrg(text) {
  const out = [];
  for (const r of JSON.parse(text).releases) {
    if (r.moniker === 'linux-next') continue;
    const date = r.released?.isodate ?? null;
    const rc = /^(\d+\.\d+)-(rc\d+)$/.exec(r.version);
    if (rc) {
      out.push({ kind: 'prerelease', version: rc[1], label: rc[2], date });
      continue;
    }
    const v = /^(\d+\.\d+)(\.\d+)?$/.exec(r.version);
    if (!v) continue;
    // A bare "7.4" from mainline is the release day; "7.4.3" only proves 7.4 is out.
    const isFinal = !v[2] && r.moniker === 'mainline';
    out.push({ kind: 'release', version: v[1], date: isFinal ? date : null, dateIsRelease: isFinal });
  }
  return out;
}

export function parseUbuntuMetaRelease(text) {
  const out = [];
  for (const f of parseStanzas(text)) {
    const v = /^(\d+\.\d+)(\.\d+)?/.exec(f.Version ?? '');
    if (!v) continue;
    const isFirst = !v[2];
    out.push({
      kind: 'release',
      version: v[1],
      codename: f.Name?.replace(/\s+/g, ' ') ?? null,
      date: isFirst ? parseTextDate(f.Date) : null,
      dateIsRelease: isFirst,
    });
  }
  return out;
}

export function parseBodhi(text) {
  const out = [];
  for (const r of JSON.parse(text).releases) {
    if (!/^F\d+$/.test(r.name)) continue;
    if ((r.state === 'current' || r.state === 'archived')) {
      out.push({ kind: 'release', version: r.version, date: r.released_on ?? null, dateIsRelease: Boolean(r.released_on), eol: r.eol ?? null });
    } else {
      out.push({ kind: 'exists', version: r.version, date: null });
    }
  }
  return out;
}

export function parseDebianRelease(text) {
  const f = parseStanzas(text)[0];
  const v = /^(\d+)(?:\.(\d+))?$/.exec(f.Version ?? '');
  if (!v) return [];
  // "Debian 14.0 Released ..." is the release day; a later point release is not.
  const isFirst = !v[2] || v[2] === '0';
  const date = isFirst ? parseTextDate(f.Description) : null;
  return [{ kind: 'release', version: v[1], codename: f.Codename ?? null, date, dateIsRelease: Boolean(date) }];
}

// gnome-shell tags: "52.alpha", "52.beta", "52.rc", "52.0", "52.1".
// The tag date is a day or two before GNOME's announced release, so it is not a release date.
export function parseGnomeTags(text) {
  const out = [];
  for (const t of JSON.parse(text)) {
    const date = t.commit?.committed_date ? new Date(t.commit.committed_date).toISOString().slice(0, 10) : null;
    const pre = /^(\d+)\.(alpha|beta|rc)(\.\d+)?$/.exec(t.name);
    if (pre) {
      out.push({ kind: 'prerelease', version: pre[1], label: pre[2] + (pre[3] ?? ''), date });
      continue;
    }
    const v = /^(\d+)\.(\d+)$/.exec(t.name);
    if (v) out.push({ kind: 'release', version: v[1], date: v[2] === '0' ? date : null, dateIsRelease: false });
  }
  return out;
}

// Also carries support dates for the version history (eol, security support, LTS flag, latest point release).
const day = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
export function parseEndOfLife(text) {
  return JSON.parse(text)
    .filter((c) => /^\d+(\.\d+)?$/.test(String(c.cycle)) && c.releaseDate)
    .map((c) => ({
      kind: 'release', version: String(c.cycle), codename: c.codename ?? null, date: c.releaseDate, dateIsRelease: true,
      eol: day(c.eol), support: day(c.support), extended: day(c.extendedSupport), lts: c.lts === true,
      latest: c.latest && c.latest !== String(c.cycle) ? String(c.latest) : null, latestDate: day(c.latestReleaseDate),
    }));
}

// Mozilla's product details: the current Firefox version and the day it shipped.
export function parseFirefoxVersions(text) {
  const d = JSON.parse(text);
  const v = /^(\d+)\.0$/.exec(d.LATEST_FIREFOX_VERSION ?? '');
  const out = [];
  if (v && d.LAST_RELEASE_DATE) out.push({ kind: 'release', version: v[1], date: d.LAST_RELEASE_DATE, dateIsRelease: true });
  const beta = /^(\d+)\.0b(\d+)$/.exec(d.LATEST_FIREFOX_RELEASED_DEVEL_VERSION ?? '');
  if (beta) out.push({ kind: 'prerelease', version: beta[1], label: `beta ${beta[2]}`, date: null });
  return out;
}

// Directory listing of Linux Mint's package archive: one folder per codename.
export function parseMintDists(text) {
  return [...text.matchAll(/href="([a-z]+)\/"/g)].map((m) => ({ kind: 'codename', codename: m[1], date: null }));
}

// Mozilla's release calendar for one Firefox version (planned dates, months ahead).
export function parseMozillaSchedule(text) {
  const d = JSON.parse(text);
  const v = /^(\d+)\.0$/.exec(d.version ?? '');
  const day = (x) => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}/.test(x) ? x.slice(0, 10) : null);
  const release = day(d.release);
  if (!v || !release) return [];
  const milestones = [['nightly_start', 'Nightly start'], ['beta_1', 'Beta 1'], ['rc_gtb', 'Release candidate'], ['release', 'Final release']]
    .map(([key, label]) => ({ label, date: day(d[key]) }))
    .filter((m) => m.date);
  return [{ kind: 'scheduled', version: v[1], date: release, milestones }];
}

// The next few Firefox versions after the newest one we have released.
export function mozillaScheduleFeeds(data) {
  const out = data.releases.filter((r) => r.family === 'firefox' && r.status === 'released').map((r) => Number(r.version));
  if (!out.length) return [];
  const newest = Math.max(...out);
  return [1, 2, 3].map((i) => `https://whattrainisitnow.com/api/release/schedule/?version=${newest + i}`);
}

const eol = (product) => ({ label: `endoflife.date: ${product}`, url: `https://endoflife.date/${product}`, feed: `https://endoflife.date/api/${product}.json`, official: false, parse: parseEndOfLife });

export const SOURCES = [
  { id: 'kernel-org', family: 'linux-kernel', official: true, label: 'kernel.org releases feed', url: 'https://www.kernel.org/', feed: 'https://www.kernel.org/releases.json', parse: parseKernelOrg },
  { id: 'eol-linux', family: 'linux-kernel', ...eol('linux') },
  { id: 'ubuntu-meta', family: 'ubuntu', official: true, label: 'Ubuntu upgrade metadata (meta-release)', url: 'https://changelogs.ubuntu.com/meta-release', feed: 'https://changelogs.ubuntu.com/meta-release', parse: parseUbuntuMetaRelease },
  { id: 'eol-ubuntu', family: 'ubuntu', ...eol('ubuntu') },
  { id: 'bodhi', family: 'fedora', official: true, label: 'Fedora Bodhi (official update system)', url: 'https://bodhi.fedoraproject.org/releases/', feed: 'https://bodhi.fedoraproject.org/releases/?rows_per_page=100&exclude_archived=true', parse: parseBodhi },
  { id: 'eol-fedora', family: 'fedora', ...eol('fedora') },
  { id: 'debian-stable', family: 'debian', official: true, label: 'Debian archive: stable Release file', url: 'https://deb.debian.org/debian/dists/stable/Release', feed: 'https://deb.debian.org/debian/dists/stable/Release', parse: parseDebianRelease },
  { id: 'eol-debian', family: 'debian', ...eol('debian') },
  { id: 'gnome-shell-tags', family: 'gnome', official: true, label: 'GNOME GitLab: gnome-shell tags', url: 'https://gitlab.gnome.org/GNOME/gnome-shell/-/tags', feed: 'https://gitlab.gnome.org/api/v4/projects/GNOME%2Fgnome-shell/repository/tags?per_page=40&order_by=version', parse: parseGnomeTags },
  { id: 'eol-linuxmint', family: 'linux-mint', ...eol('linuxmint') },
  { id: 'eol-kde-plasma', family: 'kde-plasma', ...eol('kde-plasma') },
  { id: 'eol-nixos', family: 'nixos', ...eol('nixos') },
  { id: 'mozilla-product-details', family: 'firefox', official: true, label: 'Mozilla product details', url: 'https://product-details.mozilla.org/1.0/firefox_versions.json', feed: 'https://product-details.mozilla.org/1.0/firefox_versions.json', parse: parseFirefoxVersions },
  { id: 'eol-firefox', family: 'firefox', ...eol('firefox') },
  { id: 'mozilla-schedule', family: 'firefox', official: true, label: 'Firefox release calendar (whattrainisitnow.com)', url: 'https://whattrainisitnow.com/calendar/', feeds: mozillaScheduleFeeds, parse: parseMozillaSchedule },
  { id: 'mint-dists', family: 'linux-mint', official: true, label: 'Linux Mint package archive', url: 'http://packages.linuxmint.com/dists/', feed: 'http://packages.linuxmint.com/dists/', parse: parseMintDists },
];

// Parse a feed and stamp every observation with its family and source.
export function observe(source, text) {
  const meta = { family: source.family, sourceId: source.id, official: source.official, source: { label: source.label, url: source.url } };
  return source.parse(text).map((o) => ({ ...o, ...meta }));
}
