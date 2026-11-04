// Checks every feed, prints what would change, and with --write saves it.
//   npm run update            dry run: report only
//   npm run update -- --write apply safe changes to src/data/releases.json and log them
// Rebuild the site afterwards (npm run build). Nothing is deployed or sent from here.
import { readFile, writeFile } from 'node:fs/promises';
import { SOURCES, observe } from './sources.js';
import { applyObservations } from './apply.js';
import { enrichLinks } from './links.js';
import { buildHistory } from './history.js';
import { today } from '../src/lib/forecast.js';

const DATA = new URL('../src/data/releases.json', import.meta.url);
const HISTORY = new URL('../src/data/history.json', import.meta.url);
const LOG = new URL('./log.json', import.meta.url);
const write = process.argv.includes('--write');

// Some feeds (Bodhi) are slow, so allow a minute and one retry.
async function fetchText(url, tries = 2) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'linux-release-tracker-updater/0.1' },
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (tries > 1) return fetchText(url, tries - 1);
    throw err;
  }
}

// A page address counts as real only if the project's own server answers it.
async function checkUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'linux-release-tracker-updater/0.1' }, signal: AbortSignal.timeout(20000) });
    return res.ok;
  } catch {
    return false;
  }
}

const data = JSON.parse(await readFile(DATA, 'utf8'));
// A source has one feed, or several that depend on our data (Mozilla: one per upcoming Firefox version).
const jobs = SOURCES.flatMap((s) => (s.feeds ? s.feeds(data) : [s.feed]).map((url) => ({ s, url })));
const results = await Promise.allSettled(jobs.map(async ({ s, url }) => observe(s, await fetchText(url))));
const observations = [];
const errors = [];
results.forEach((r, i) => {
  if (r.status === 'fulfilled') observations.push(...r.value);
  else errors.push(`${jobs[i].s.label}${jobs[i].s.feeds ? ` (${jobs[i].url.split('=').pop()})` : ''}: ${r.reason.message}`);
});

const now = today();
const applied = applyObservations(data, observations, now);
const { data: next, changes, reviews } = applied;
const linkChanges = await enrichLinks(next, applied.touched, checkUrl);
changes.push(...linkChanges);
if (linkChanges.length) next.updated = now.toISOString().slice(0, 10);
const oldHistory = JSON.parse(await readFile(HISTORY, 'utf8').catch(() => '{}'));
const history = buildHistory(oldHistory, observations, now);
const historyChanged = JSON.stringify(history) !== JSON.stringify(oldHistory);

const list = (items) => (items.length ? items.map((x) => `  - ${x}`).join('\n') : '  (none)');
console.log(`Updater ${now.toISOString().slice(0, 10)}: ${jobs.length - errors.length}/${jobs.length} feeds read, ${observations.length} observations`);
console.log(`\nChanges${write ? '' : ' (dry run, not saved)'}:\n${list(changes)}`);
console.log(`\nVersion history: ${historyChanged ? 'updated' : 'no change'}`);
console.log(`\nFor the owner to review:\n${list(reviews)}`);
if (errors.length) console.log(`\nFeeds that failed (nothing changed from them):\n${list(errors)}`);

if (write) {
  if (changes.length) await writeFile(DATA, JSON.stringify(next, null, 2) + '\n');
  if (historyChanged) await writeFile(HISTORY, JSON.stringify(history, null, 2) + '\n');
  let log = [];
  try {
    log = JSON.parse(await readFile(LOG, 'utf8'));
  } catch {}
  log.push({ at: new Date().toISOString(), changes, reviews, errors });
  await writeFile(LOG, JSON.stringify(log.slice(-200), null, 2) + '\n');
  // Short summary for the owner's alert. It only changes when there is something new to say,
  // so the daily job opens an issue only then.
  const summary = `## Updater summary\n\n### Changes applied\n${list(changes)}\n\n### For the owner to review\n${list(reviews)}\n\n### Feeds that failed\n${list(errors)}\n`;
  await writeFile(new URL('./last-run.md', import.meta.url), summary);
  console.log(changes.length || historyChanged ? '\nSaved. Run `npm test && npm run build` to rebuild the site.' : '\nNothing to save.');
}
