// Checks every feed, prints what would change, and with --write saves it.
//   npm run update            dry run: report only
//   npm run update -- --write apply safe changes to src/data/releases.json and log them
// Rebuild the site afterwards (npm run build). Nothing is deployed or sent from here.
import { readFile, writeFile } from 'node:fs/promises';
import { SOURCES, observe } from './sources.js';
import { applyObservations } from './apply.js';
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

const results = await Promise.allSettled(SOURCES.map(async (s) => observe(s, await fetchText(s.feed))));
const observations = [];
const errors = [];
results.forEach((r, i) => {
  if (r.status === 'fulfilled') observations.push(...r.value);
  else errors.push(`${SOURCES[i].label}: ${r.reason.message}`);
});

const now = today();
const data = JSON.parse(await readFile(DATA, 'utf8'));
const { data: next, changes, reviews } = applyObservations(data, observations, now);
const oldHistory = JSON.parse(await readFile(HISTORY, 'utf8').catch(() => '{}'));
const history = buildHistory(oldHistory, observations, now);
const historyChanged = JSON.stringify(history) !== JSON.stringify(oldHistory);

const list = (items) => (items.length ? items.map((x) => `  - ${x}`).join('\n') : '  (none)');
console.log(`Updater ${now.toISOString().slice(0, 10)}: ${SOURCES.length - errors.length}/${SOURCES.length} feeds read, ${observations.length} observations`);
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
