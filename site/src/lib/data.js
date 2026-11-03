import data from '../data/releases.json';
import { effectiveStatus, parseDay, sortDate, today } from './forecast.js';

export const families = data.families;
export const releases = data.releases;
export const updated = data.updated;

export function getFamily(id) {
  return families.find((f) => f.id === id);
}

export function getRelease(id) {
  return releases.find((r) => r.id === id);
}

export function releaseTitle(release) {
  const base = `${getFamily(release.family).name} ${release.version}${release.lts ? ' LTS' : ''}`;
  return release.codename ? `${base} "${release.codename}"` : base;
}

export function releasePath(release) {
  return `/${release.family}/${release.slug}/`;
}

export function upcoming(now = today()) {
  return releases
    .filter((r) => effectiveStatus(r, now) !== 'released')
    .sort((a, b) => sortDate(a) - sortDate(b));
}

export function recentlyReleased() {
  return releases
    .filter((r) => r.status === 'released')
    .sort((a, b) => parseDay(b.date) - parseDay(a.date));
}
