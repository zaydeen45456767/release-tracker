// Decides whether this hourly check should do a full update.
// GitHub's schedule is best-effort and sometimes skips runs, so the decision looks at when the last full run
// really happened (the newest entry in updater/log.json) instead of trusting the clock:
//   - full update when the last one is 170+ minutes old (about every 3 hours, and it catches up after a skipped run)
//   - or when a release is within 2 days before to 3 days after its date and the last one is 55+ minutes old
//   - or on a manual run
// The slow outside-link check runs on the first full update of each UTC day, and so does the build that
// refreshes day counts on the pages ("scheduled in 34 days").
import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseDay, daysBetween, today } from '../src/lib/forecast.js';

const BEFORE = 2;
const AFTER = 3;
const MAX_WINDOW = 14;
const MINUTE = 60 * 1000;

export function hotReleases(releases, now = today()) {
  return releases.filter((r) => {
    if (r.status === 'released') return false;
    const start = parseDay(r.date ?? r.window.start);
    const end = parseDay(r.date ?? r.window.end);
    if (daysBetween(start, end) > MAX_WINDOW) return false;
    return daysBetween(now, start) <= BEFORE && daysBetween(end, now) <= AFTER;
  });
}

export function decide({ now, lastAt, hot, manual }) {
  const age = lastAt ? (now - lastAt) / MINUTE : Infinity;
  const run = manual || age >= 170 || (hot > 0 && age >= 55);
  const newDay = !lastAt || lastAt.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);
  return { run, links: run && (manual || newDay), age };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data = JSON.parse(readFileSync(new URL('../src/data/releases.json', import.meta.url), 'utf8'));
  const log = JSON.parse(readFileSync(new URL('./log.json', import.meta.url), 'utf8').toString() || '[]');
  const lastAt = log.length ? new Date(log.at(-1).at) : null;
  const hot = hotReleases(data.releases, process.argv[2] ? parseDay(process.argv[2]) : today()).map((r) => `${r.family} ${r.version}`);
  const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  const d = decide({ now: new Date(), lastAt, hot: hot.length, manual });
  const why = manual ? 'manual' : d.age >= 170 ? 'every 3 hours' : 'launch watch';
  console.log(d.run ? `Run: ${why}${hot.length ? ` (${hot.join(', ')})` : ''}${d.links ? ' + link check' : ''}` : `Skip: last full run ${Math.round(d.age)} minutes ago.`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `run=${d.run}\nlinks=${d.links}\n`);
}
