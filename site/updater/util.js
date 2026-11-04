// Small pure helpers shared by the updater modules.
import { daysBetween, parseDay } from '../src/lib/forecast.js';

const DAY = 24 * 60 * 60 * 1000;

export function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

export const addDays = (day, n) => new Date(parseDay(day).getTime() + n * DAY).toISOString().slice(0, 10);
export const longDay = (day) => parseDay(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const weekday = (day) => parseDay(day).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });

export function evidenceKey(obs) {
  return `${obs.sourceId}:${obs.version}${obs.label ? `-${obs.label}` : ''}`;
}

// Choose the release day: an official release-day date, then an aggregator's, then (for
// scheduled releases only) the project's own scheduled date if the final tag landed within a week of it.
export function pickDate(record, seen) {
  const dated = seen.filter((o) => o.date && o.dateIsRelease);
  const pick = dated.find((o) => o.official) ?? dated[0];
  if (pick) return { date: pick.date, obs: pick, dated };
  if (record.status === 'scheduled') {
    const tag = seen.find((o) => o.date);
    if (tag && Math.abs(daysBetween(parseDay(record.date), parseDay(tag.date))) <= 7) {
      return { date: record.date, obs: tag, dated, viaSchedule: true };
    }
  }
  return null;
}

// Replace a date in prose (with its weekday, if it has one) so a moved date does not leave stale text behind.
export function moveDateInText(text, oldDay, newDay) {
  return text
    .replaceAll(`${weekday(oldDay)} ${longDay(oldDay)}`, `${weekday(newDay)} ${longDay(newDay)}`)
    .replaceAll(longDay(oldDay), longDay(newDay));
}
