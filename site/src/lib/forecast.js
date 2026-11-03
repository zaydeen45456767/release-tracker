const DAY = 24 * 60 * 60 * 1000;

export function parseDay(s) {
  return new Date(`${s}T00:00:00Z`);
}

export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / DAY);
}

export function today() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// The status shown to readers. A forecast whose window closed more than
// 30 days ago with no release is kept on the site as "missed", never deleted.
export function effectiveStatus(release, now = today()) {
  if (release.status !== 'predicted') return release.status;
  const end = parseDay(release.window.end);
  if (daysBetween(end, now) > 30) return 'missed';
  return 'predicted';
}

export function headline(release, now = today()) {
  const status = effectiveStatus(release, now);
  if (status === 'released') return `Released ${formatDay(release.date)}`;
  if (status === 'missed') {
    return `Expected ${formatWindow(release.window)}, not released yet`;
  }
  if (status === 'scheduled') {
    const d = daysBetween(now, parseDay(release.date));
    return d < 0 ? `Scheduled ${formatDay(release.date)}` : `Scheduled ${formatDay(release.date)} (${inDays(d)})`;
  }
  const start = parseDay(release.window.start);
  const end = parseDay(release.window.end);
  if (now >= start && now <= end) return `Expected now: ${formatWindow(release.window)}`;
  if (now > end) return `Overdue: expected ${formatWindow(release.window)}`;
  return `Expected ${formatWindow(release.window)}`;
}

export function inDays(d) {
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d < 0) return `${-d} days ago`;
  return `in ${d} days`;
}

export function formatDay(s) {
  return parseDay(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function formatWindow(w) {
  const a = parseDay(w.start);
  const b = parseDay(w.end);
  const sameMonth = a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  if (sameMonth) {
    const month = a.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    return `${month} ${a.getUTCDate()}-${b.getUTCDate()}, ${a.getUTCFullYear()}`;
  }
  return `${formatDay(w.start)} to ${formatDay(w.end)}`;
}

// A page is only offered to search engines when it has real content:
// a summary, at least one source, and for forecasts at least two pieces of evidence.
export function isIndexable(release) {
  if (release.sources.length < 1 || release.summary.length < 40) return false;
  return release.status === 'predicted' ? release.evidence.length >= 2 : release.evidence.length >= 1;
}

// Grade a forecast kept from before release (the updater stores it under `forecast`).
// daysOff is 0 inside the window, positive if the release came late, negative if early.
export function gradeForecast(release) {
  const f = release.forecast;
  if (release.status !== 'released' || f?.status !== 'predicted') return null;
  const d = parseDay(release.date);
  const start = parseDay(f.window.start);
  const end = parseDay(f.window.end);
  const daysOff = d < start ? daysBetween(start, d) : d > end ? daysBetween(end, d) : 0;
  return { hit: daysOff === 0, daysOff };
}

export function sortDate(release) {
  return parseDay(release.date ?? release.window.start);
}
