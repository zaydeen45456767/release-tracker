// Version history, official download links and support status for each project.
// History comes from src/data/history.json (kept fresh by the updater) merged with our own release pages.
import history from '../data/history.json';
import { releases, getFamily } from './data.js';
import { compareVersions } from '../../updater/apply.js';
import { daysBetween, parseDay } from './forecast.js';

const lower = (s) => (s ?? '').toLowerCase();

// Official per-version download (or notes) page. Patterns checked on 2026-11-03, see research_notes/release-data.
export function downloadFor(familyId, v, now) {
  const ended = v.eol && parseDay(v.eol) < now;
  switch (familyId) {
    case 'ubuntu':
      return ended
        ? { url: `https://old-releases.ubuntu.com/releases/${v.version}/`, host: 'old-releases.ubuntu.com', kind: 'files' }
        : { url: `https://releases.ubuntu.com/${v.version}/`, host: 'releases.ubuntu.com', kind: 'page' };
    case 'fedora':
      return ended
        ? { url: `https://archives.fedoraproject.org/pub/archive/fedora/linux/releases/${v.version}/`, host: 'archives.fedoraproject.org', kind: 'files' }
        : { url: `https://dl.fedoraproject.org/pub/fedora/linux/releases/${v.version}/`, host: 'dl.fedoraproject.org', kind: 'files' };
    case 'debian':
      return v.codename ? { url: `https://www.debian.org/releases/${lower(v.codename)}/`, host: 'debian.org', kind: 'info' } : null;
    case 'linux-mint':
      return v.codename ? { url: `https://www.linuxmint.com/rel_${lower(v.codename)}.php`, host: 'linuxmint.com', kind: 'notes' } : null;
    case 'gnome':
      return { url: `https://release.gnome.org/${v.version}/`, host: 'release.gnome.org', kind: 'notes', notesOnly: true };
    case 'linux-kernel':
      return { url: `https://cdn.kernel.org/pub/linux/kernel/v${v.version.split('.')[0]}.x/`, host: 'cdn.kernel.org', kind: 'files' };
    case 'kde-plasma':
      return { url: `https://kde.org/announcements/plasma/${v.version.split('.')[0]}/${v.version}.0/`, host: 'kde.org', kind: 'notes', notesOnly: true };
    case 'nixos':
      // Older images are not kept at a stable per-version address, so only the supported release gets a link.
      return ended ? null : { url: 'https://nixos.org/download/', host: 'nixos.org', kind: 'page' };
    case 'firefox':
      // ESR builds live in folders named like "153.6.0esr".
      return { url: `https://ftp.mozilla.org/pub/firefox/releases/${v.latest && v.latest.startsWith(v.version + '.') ? v.latest : `${v.version}.0`}${v.lts ? 'esr' : ''}/`, host: 'ftp.mozilla.org', kind: 'files' };
    default:
      return null;
  }
}

// All versions of a project, newest first: our release pages (including upcoming ones) plus the feed history.
export function versionHistory(familyId, now) {
  const rows = (history[familyId] ?? []).map((h) => ({ ...h }));
  for (const r of releases.filter((x) => x.family === familyId)) {
    let row = rows.find((x) => x.version === r.version);
    if (!row) rows.push((row = { version: r.version, codename: r.codename }));
    row.page = r.id;
    row.status = r.status;
    if (r.status === 'released') row.released = r.date;
    else row.upcoming = r;
    if (r.lts) row.lts = true;
    row.codename ??= r.codename;
  }
  rows.sort((a, b) => compareVersions(b.version, a.version));
  const released = rows.filter((x) => x.released);
  for (const row of rows) {
    if (row.released) {
      row.download = downloadFor(familyId, row, now);
      const prev = released.find((x) => compareVersions(x.version, row.version) < 0 && x.released < row.released);
      if (prev) row.gapDays = daysBetween(parseDay(prev.released), parseDay(row.released));
    }
    const end = row.support ?? row.eol;
    row.supported = row.released ? !end || parseDay(end) >= now : null;
  }
  return rows;
}

// Support status for one version, for "Supported until ..." lines.
export function supportOf(familyId, version, now) {
  const row = versionHistory(familyId, now).find((x) => x.version === version);
  if (!row) return null;
  const end = row.support ?? row.eol;
  return { ...row, end, daysLeft: end ? daysBetween(now, parseDay(end)) : null };
}

// Newest released version of a project, and its newest LTS (when the project has LTS releases).
export function latestStable(familyId) {
  const out = releases.filter((r) => r.family === familyId && r.status === 'released').sort((a, b) => b.date.localeCompare(a.date));
  return out[0] ?? null;
}

export function latestLts(familyId, now) {
  const rows = versionHistory(familyId, now).filter((x) => x.lts && x.released && x.supported);
  return rows[0] ?? null;
}

// Average gap between the last few releases, in days (computed, used on forecast pages).
export function averageGap(familyId, now, count = 6) {
  const gaps = versionHistory(familyId, now).filter((x) => x.gapDays).slice(0, count).map((x) => x.gapDays);
  return gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
}

export function familyName(id) {
  return getFamily(id).name;
}

// The main Download button for a release: the project's real download page for its newest version
// (or Ubuntu's page for that exact version), the archive files for older supported versions.
// Desktops (GNOME, KDE Plasma) are not downloaded on their own, so the button says "Get" and goes to
// the project's "where to get it" page.
export function primaryDownload(release, now) {
  const f = getFamily(release.family);
  const host = (u) => new URL(u).hostname.replace(/^www\./, '');
  const sup = supportOf(release.family, release.version, now);
  const newest = latestStable(release.family)?.id === release.id;
  if (release.family === 'gnome' || release.family === 'kde-plasma') {
    return { url: f.download.url, host: host(f.download.url), label: `Get ${f.name}` };
  }
  if (release.family === 'ubuntu') {
    return { ...downloadFor('ubuntu', { ...sup, version: release.version }, now), label: 'Download' };
  }
  if (newest) {
    const first = f.editions?.find((e) => !e.forVersion || e.forVersion === release.version);
    const url = release.family === 'linux-mint' && first ? first.url : f.download.url;
    return { url, host: host(url), label: 'Download' };
  }
  if (sup && !sup.supported) return null; // no download button for versions out of support
  const d = downloadFor(release.family, { ...sup, version: release.version, codename: release.codename }, now);
  return d ? { ...d, label: d.kind === 'files' ? 'Download files' : 'Download' } : null;
}

// Timeline for a released version: previous version, this release, latest update, the next
// version and end of support, with "today" placed between what happened and what is still ahead.
export function releasedStations(release, now) {
  const rows = versionHistory(release.family, now);
  const i = rows.findIndex((x) => x.version === release.version);
  const prev = rows.slice(i + 1).find((x) => x.released);
  const next = rows.slice(0, i).reverse().find((x) => x.released || x.upcoming);
  const sup = supportOf(release.family, release.version, now);
  const day = (d) => parseDay(d) <= now;
  const out = [];
  if (prev) out.push({ type: 'station', label: `${prev.version} out`, date: prev.released, done: true, href: prev.page });
  out.push({ type: 'station', label: 'Released', date: release.date, done: true, final: true });
  if (sup?.latest && sup.latestDate && sup.latestDate > release.date) out.push({ type: 'station', label: `${sup.latest} update`, date: sup.latestDate, done: day(sup.latestDate) });
  if (next) {
    const u = next.upcoming;
    out.push(u
      ? { type: 'station', label: `${next.version} ${u.status === 'scheduled' ? 'due' : 'expected'}`, date: u.date, window: u.date ? undefined : u.window, done: false, est: u.status === 'predicted', href: next.page }
      : { type: 'station', label: `${next.version} out`, date: next.released, done: true, href: next.page });
  }
  if (sup?.end) out.push({ type: 'station', label: sup.daysLeft >= 0 ? 'Support ends' : 'Support ended', date: sup.end, done: sup.daysLeft < 0 });
  out.sort((a, b) => (a.date ?? a.window.start).localeCompare(b.date ?? b.window.start));
  const t = out.findIndex((s) => !s.done);
  if (t >= 0) out.splice(t, 0, { type: 'today', label: 'Today', date: now.toISOString().slice(0, 10) });
  return out;
}
