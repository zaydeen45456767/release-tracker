// Presentation helpers: status labels, short dates and the stops on a release timeline. Pure, so they are tested.
import { siCinnamon, siDebian, siFedora, siFirefoxbrowser, siFlathub, siGnome, siKde, siKdeneon, siKdeplasma, siKubuntu, siLinux, siLinuxmint, siLubuntu, siNixos, siUbuntu, siUbuntumate, siXfce, siXubuntu } from 'simple-icons';
import { daysBetween, effectiveStatus, parseDay } from './forecast.js';

// Every project uses the same ink colour: the owner wants a calm, single-accent site.
const LOOKS = {
  ubuntu: { color: 'var(--ink)', mono: 'Ub', icon: siUbuntu.path },
  fedora: { color: 'var(--ink)', mono: 'Fe', icon: siFedora.path },
  debian: { color: 'var(--ink)', mono: 'De', icon: siDebian.path },
  'linux-mint': { color: 'var(--ink)', mono: 'Mi', icon: siLinuxmint.path },
  gnome: { color: 'var(--ink)', mono: 'Gn', icon: siGnome.path },
  'linux-kernel': { color: 'var(--ink)', mono: 'Lx', icon: siLinux.path },
  'kde-plasma': { color: 'var(--ink)', mono: 'Kd', icon: siKdeplasma.path },
  nixos: { color: 'var(--ink)', mono: 'Nx', icon: siNixos.path },
  firefox: { color: 'var(--ink)', mono: 'Ff', icon: siFirefoxbrowser.path },
};

export function familyLook(id) {
  return LOOKS[id] ?? { color: 'var(--ink)', mono: id.slice(0, 2), icon: '' };
}

// Short status label for lists and cards. tone drives the colour.
export function boardStatus(release, now) {
  const status = effectiveStatus(release, now);
  if (status === 'released') return { word: 'Released', tone: 'go' };
  if (status === 'missed') return { word: 'Missed', tone: 'stop' };
  if (status === 'scheduled') {
    const d = daysBetween(now, parseDay(release.date));
    if (d < 0) return { word: 'Late', tone: 'stop' };
    if (d <= 7) return { word: 'This week', tone: 'due' };
    return { word: 'Scheduled', tone: 'ok' };
  }
  const start = parseDay(release.window.start);
  const end = parseDay(release.window.end);
  if (now > end) return { word: 'Overdue', tone: 'stop' };
  if (now >= start) return { word: 'Due now', tone: 'due' };
  if (daysBetween(now, start) <= 7) return { word: 'This week', tone: 'due' };
  return { word: 'Expected', tone: 'est' };
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (s) => {
  const d = parseDay(s);
  return { day: d.getUTCDate(), mon: MON[d.getUTCMonth()], year: d.getUTCFullYear() };
};

// "22 Apr 2027", "20-27 Dec 2026", "15 Apr-15 May 2027", "20 Dec 26-31 Jan 27"
export function boardWhen(release) {
  if (release.date) {
    const a = parts(release.date);
    return `${a.day} ${a.mon} ${a.year}`;
  }
  const a = parts(release.window.start);
  const b = parts(release.window.end);
  if (a.year !== b.year) return `${a.day} ${a.mon} ${String(a.year).slice(2)}-${b.day} ${b.mon} ${String(b.year).slice(2)}`;
  if (a.mon === b.mon) return `${a.day}-${b.day} ${a.mon} ${a.year}`;
  return `${a.day} ${a.mon}-${b.day} ${b.mon} ${a.year}`;
}

// The day a countdown points at: the date, or the start of the window.
export function targetDay(release) {
  return release.date ?? release.window.start;
}

function withToday(stations, now, todayLabel) {
  const i = stations.findIndex((s) => !s.done);
  if (i < 0) return stations;
  return [...stations.slice(0, i), { type: 'today', label: todayLabel, date: now.toISOString().slice(0, 10) }, ...stations.slice(i)];
}

// Stations on one release's line, metro-map style (evenly spaced, in order):
// the previous release, its milestones, then the release itself, with "today" between past and future.
export function releaseStations(release, all, now) {
  const own = release.date ?? release.window.start;
  const previous = all
    .filter((r) => r.family === release.family && r.id !== release.id && r.status === 'released' && r.date < own)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const stations = [];
  if (previous) stations.push({ type: 'station', label: `${previous.version} out`, date: previous.date, done: true, href: previous.id });
  for (const m of [...release.milestones].sort((a, b) => a.date.localeCompare(b.date))) {
    if (m.label === 'Final release') continue;
    const est = /expected|estimate/i.test(m.label);
    const label = m.label.replace(/\s*\((expected|unofficial estimate)\)/i, '');
    stations.push({ type: 'station', label, date: m.date, done: parseDay(m.date) <= now, est });
  }
  const released = release.status === 'released';
  stations.push(
    release.date
      ? { type: 'station', label: released ? 'Released' : 'Release', date: release.date, done: released, final: true }
      : { type: 'station', label: 'Release window', window: release.window, done: false, final: true, est: true },
  );
  return released ? stations : withToday(stations, now, 'You are here');
}

// One station per version for a project's line on its hub page.
export function familyStations(familyReleases, now) {
  const sorted = [...familyReleases].sort((a, b) => targetDay(a).localeCompare(targetDay(b)));
  const stations = sorted.map((r) => ({
    type: 'station',
    label: r.version,
    date: r.date,
    window: r.date ? undefined : r.window,
    done: r.status === 'released',
    est: r.status === 'predicted',
    href: r.id,
  }));
  return withToday(stations, now, 'Today');
}

// Icon for an edition or flavor: its own logo when Simple Icons has one, otherwise the project's.
const EXTRA = { kdeneon: siKdeneon, flathub: siFlathub, kubuntu: siKubuntu, xubuntu: siXubuntu, lubuntu: siLubuntu, ubuntumate: siUbuntumate, kde: siKde, xfce: siXfce, cinnamon: siCinnamon };
export function iconPath(key) {
  return EXTRA[key]?.path ?? familyLook(key).icon;
}
