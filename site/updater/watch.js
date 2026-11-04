// Decides whether this hourly run should do a full update.
// Full update: every 3 hours (00, 03, 06 ... UTC), on a manual run, or every hour while a release is close to its date.
// The slow outside-link check runs once a day (06:00 UTC) and on manual runs.
// "Close" means 2 days before to 3 days after an exact date, or the same around a window of 14 days or less.
import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseDay, daysBetween, today } from '../src/lib/forecast.js';

const BEFORE = 2;
const AFTER = 3;
const MAX_WINDOW = 14;

export function hotReleases(releases, now = today()) {
  return releases.filter((r) => {
    if (r.status === 'released') return false;
    const start = parseDay(r.date ?? r.window.start);
    const end = parseDay(r.date ?? r.window.end);
    if (daysBetween(start, end) > MAX_WINDOW) return false;
    return daysBetween(now, start) <= BEFORE && daysBetween(end, now) <= AFTER;
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data = JSON.parse(readFileSync(new URL('../src/data/releases.json', import.meta.url), 'utf8'));
  const now = process.argv[2] ? parseDay(process.argv[2]) : today();
  const hot = hotReleases(data.releases, now).map((r) => `${r.family} ${r.version}`);
  const hour = new Date().getUTCHours();
  const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  const periodic = hour % 3 === 0;
  const links = manual || hour === 6;
  const run = manual || periodic || hot.length > 0;
  console.log(run ? `Run: ${manual ? 'manual' : periodic ? 'every 3 hours' : 'launch watch'}${hot.length ? ` (${hot.join(', ')})` : ''}${links ? ' + link check' : ''}` : 'Skip: nothing close to launch.');
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `run=${run}\nlinks=${links}\n`);
}
