import test from 'node:test';
import assert from 'node:assert/strict';
import { observe, parseMozillaSchedule, mozillaScheduleFeeds, SOURCES } from '../updater/sources.js';
import { applyObservations } from '../updater/apply.js';
import { kernelWindow, MAX_NEW_PAGES } from '../updater/plan.js';
import { enrichLinks } from '../updater/links.js';
import { isIndexable, parseDay } from '../src/lib/forecast.js';

const day = (s) => parseDay(s);
const src = (id) => SOURCES.find((s) => s.id === id);
const families = [
  { id: 'firefox', name: 'Firefox' },
  { id: 'linux-kernel', name: 'Linux kernel' },
  { id: 'gnome', name: 'GNOME' },
  { id: 'ubuntu', name: 'Ubuntu' },
];
const rec = (o) => ({ codename: null, milestones: [], evidence: [], sources: [], ...o, slug: o.version.replace(/\./g, '-') });
const ff159 = rec({ id: 'firefox-159', family: 'firefox', version: '159', status: 'released', date: '2026-10-27', summary: 'Firefox 159 is the current Firefox version, released on 27 October 2026. Firefox 160 replaces it on 10 November 2026.' });
const ff160 = rec({ id: 'firefox-160', family: 'firefox', version: '160', status: 'scheduled', date: '2026-11-10', summary: 'Firefox 160 is scheduled for Tuesday 10 November 2026, according to Mozilla.', milestones: [{ label: 'Beta 1', date: '2026-10-26' }], useNow: 'firefox-159' });
const schedule = (version, release, extra = {}) => JSON.stringify({ version: `${version}.0`, nightly_start: '2026-10-01 00:00:00+00:00', beta_1: '2026-10-26 13:00:00+00:00', rc_gtb: '2026-11-05 00:00:00+00:00', release: `${release} 14:00:00+00:00`, ...extra });
const plan = (v, release, extra) => observe(src('mozilla-schedule'), schedule(v, release, extra));

test('Mozilla calendar: version, release day and milestones are read; the feed list follows our newest release', () => {
  const [o] = parseMozillaSchedule(schedule(161, '2026-11-24'));
  assert.equal(o.kind, 'scheduled');
  assert.equal(o.version, '161');
  assert.equal(o.date, '2026-11-24');
  assert.deepEqual(o.milestones.map((m) => m.label), ['Nightly start', 'Beta 1', 'Release candidate', 'Final release']);
  assert.deepEqual(parseMozillaSchedule('{"version":"nightly"}'), []);
  assert.deepEqual(mozillaScheduleFeeds({ releases: [ff159, ff160] }).map((u) => u.split('=').pop()), ['160', '161', '162']);
});

test('a version on the official calendar gets a scheduled page that search engines may index', () => {
  const { data, changes } = applyObservations({ families, releases: [ff159, ff160] }, plan(162, '2026-12-08'), day('2026-11-04'));
  const page = data.releases.find((r) => r.id === 'firefox-162');
  assert.equal(page.status, 'scheduled');
  assert.equal(page.date, '2026-12-08');
  assert.equal(page.useNow, 'firefox-159');
  assert.match(page.summary, /Tuesday 8 December 2026/);
  assert.ok(isIndexable(page));
  assert.ok(changes.some((c) => /firefox-162: new page created/.test(c)));
  // a second run adds nothing
  const again = applyObservations(data, plan(162, '2026-12-08'), day('2026-11-04'));
  assert.equal(again.changes.length, 0);
});

test('calendar never back-fills old versions or creates a page with an impossible date', () => {
  const old = applyObservations({ families, releases: [ff159, ff160] }, plan(158, '2027-01-01'), day('2026-11-04'));
  assert.equal(old.data.releases.length, 2);
  const bad = applyObservations({ families, releases: [ff159, ff160] }, plan(161, '2026-10-01'), day('2026-09-01'));
  assert.equal(bad.data.releases.length, 2);
  assert.ok(bad.reviews.some((t) => /not after 159/.test(t)));
});

test('a moved date is applied, kept as first published, written into the summary, and survives the flip', () => {
  const moved = applyObservations({ families, releases: [ff159, ff160] }, plan(160, '2026-11-12'), day('2026-11-04'));
  const p = moved.data.releases.find((r) => r.id === 'firefox-160');
  assert.equal(p.date, '2026-11-12');
  assert.equal(p.firstPublished.date, '2026-11-10');
  assert.match(p.summary, /Thursday 12 November 2026/);
  assert.ok(p.evidence.some((e) => /moved Firefox 160 from 10 November 2026 to 12 November 2026/.test(e.text)));
  const mozilla = observe(src('mozilla-product-details'), JSON.stringify({ LATEST_FIREFOX_VERSION: '160.0', LAST_RELEASE_DATE: '2026-11-12' }));
  const out = applyObservations(moved.data, mozilla, day('2026-11-12')).data.releases.find((r) => r.id === 'firefox-160');
  assert.equal(out.status, 'released');
  assert.equal(out.forecast.date, '2026-11-10'); // the forecast as first published
  assert.equal(out.firstPublished, undefined);
});

test('an official date turns a predicted page into a scheduled one and keeps the estimate', () => {
  const predicted = rec({ id: 'firefox-161', family: 'firefox', version: '161', status: 'predicted', window: { start: '2026-11-20', end: '2026-12-01' }, chance: 60, summary: 'Firefox 161 has no date yet.' });
  const { data } = applyObservations({ families, releases: [ff159, ff160, predicted] }, plan(161, '2026-11-24'), day('2026-11-04'));
  const p = data.releases.find((r) => r.id === 'firefox-161');
  assert.equal(p.status, 'scheduled');
  assert.equal(p.window, undefined);
  assert.deepEqual(p.firstPublished.window, { start: '2026-11-20', end: '2026-12-01' });
});

const kernelFeed = (...rcs) => observe(src('kernel-org'), JSON.stringify({ releases: rcs.map(([v, d]) => ({ moniker: 'mainline', version: v, released: { isodate: d } })) }));
const kernel73 = rec({ id: 'linux-kernel-7-3', family: 'linux-kernel', version: '7.3', status: 'released', date: '2026-10-18', summary: 'Linux 7.3 is the newest stable Linux kernel, released on 18 October 2026.' });

test('kernel window: ships the week after the last release candidate, never before rc7', () => {
  assert.deepEqual(kernelWindow('2026-11-01', 3), { start: '2026-12-20', end: '2026-12-27' });
  assert.deepEqual(kernelWindow('2026-11-01', 7), { start: '2026-12-20', end: '2026-12-27' });
  assert.deepEqual(kernelWindow('2026-11-01', 8), { start: '2026-12-27', end: '2027-01-03' });
});

test('a kernel release candidate with no page creates an indexable forecast; more rcs move the window', () => {
  const first = applyObservations({ families, releases: [kernel73] }, kernelFeed(['7.4-rc1', '2026-11-01'], ['7.4-rc2', '2026-11-08']), day('2026-11-09'));
  const page = first.data.releases.find((r) => r.id === 'linux-kernel-7-4');
  assert.equal(page.status, 'predicted');
  assert.deepEqual(page.window, { start: '2026-12-20', end: '2026-12-27' });
  assert.ok(page.evidence.length >= 3); // two rc tags and our estimate
  assert.ok(isIndexable(page));
  const later = applyObservations(first.data, kernelFeed(...['1', '2', '3', '4', '5', '6', '7', '8'].map((n, i) => [`7.4-rc${n}`, new Date(Date.UTC(2026, 10, 1 + 7 * i)).toISOString().slice(0, 10)])), day('2026-12-21'));
  const moved = later.data.releases.find((r) => r.id === 'linux-kernel-7-4');
  assert.deepEqual(moved.window, { start: '2026-12-27', end: '2027-01-03' });
  assert.deepEqual(moved.firstPublished.window, { start: '2026-12-20', end: '2026-12-27' });
});

test('a GNOME alpha with no page creates a forecast about six months after the last release', () => {
  const gnome51 = rec({ id: 'gnome-51', family: 'gnome', version: '51', status: 'released', date: '2026-09-16', summary: 'GNOME 51.' });
  const tags = observe(src('gnome-shell-tags'), JSON.stringify([{ name: '52.alpha', commit: { committed_date: '2026-12-30T10:00:00Z' } }]));
  const { data } = applyObservations({ families, releases: [gnome51] }, tags, day('2027-01-02'));
  const p = data.releases.find((r) => r.id === 'gnome-52');
  assert.equal(p.status, 'predicted');
  assert.ok(p.window.start > '2027-02-20' && p.window.end < '2027-04-15');
});

test('a newer version a feed shows as released gets a released page; old versions and glitches do not', () => {
  const ub = rec({ id: 'ubuntu-26-10', family: 'ubuntu', version: '26.10', status: 'released', date: '2026-10-15', summary: 'Ubuntu 26.10.' });
  const feed = (v, d) => observe(src('eol-ubuntu'), JSON.stringify([{ cycle: v, releaseDate: d, codename: 'Test Tapir' }]));
  const ok = applyObservations({ families, releases: [ub] }, feed('27.04', '2027-04-22'), day('2027-04-23'));
  const page = ok.data.releases.find((r) => r.id === 'ubuntu-27-04');
  assert.equal(page.status, 'released');
  assert.ok(isIndexable(page));
  assert.match(ub.summary, /Ubuntu 26.10/);
  assert.equal(applyObservations({ families, releases: [ub] }, feed('27.04', '2026-01-01'), day('2027-04-23')).data.releases.length, 1); // too old
  assert.equal(applyObservations({ families, releases: [ub] }, feed('26.04', '2026-04-23'), day('2027-04-23')).data.releases.length, 1); // older version
});

test('never creates more than the cap in one run', () => {
  const many = Array.from({ length: 9 }, (_, i) => plan(160 + i, `2026-12-${String(10 + i).padStart(2, '0')}`)).flat();
  const { data } = applyObservations({ families, releases: [ff159] }, many, day('2026-11-04'));
  assert.equal(data.releases.length - 1, MAX_NEW_PAGES);
});

test('"is the current version" text is rewritten when a newer release comes out; an LTS stays current', () => {
  const lts = rec({ id: 'ubuntu-26-04', family: 'ubuntu', version: '26.04', status: 'released', date: '2026-04-23', summary: 'Ubuntu 26.04 LTS is the current long-term support release, out since 23 April 2026.' });
  const interim = rec({ id: 'ubuntu-26-10', family: 'ubuntu', version: '26.10', status: 'released', date: '2026-10-15', summary: 'Ubuntu 26.10 is the newest Ubuntu release.' });
  const next = rec({ id: 'ubuntu-27-04', family: 'ubuntu', version: '27.04', status: 'scheduled', date: '2027-04-22', summary: 'Ubuntu 27.04 is next.' });
  const eol = observe(src('eol-ubuntu'), JSON.stringify([{ cycle: '27.04', releaseDate: '2027-04-22' }]));
  const { data } = applyObservations({ families, releases: [lts, interim, next] }, eol, day('2027-04-23'));
  const byId = (id) => data.releases.find((r) => r.id === id);
  assert.equal(byId('ubuntu-27-04').status, 'released');
  assert.match(byId('ubuntu-26-10').summary, /replaced it as the newest version on 22 April 2027/);
  assert.match(byId('ubuntu-26-04').summary, /is the current long-term support release/);
});

test('release-notes links are added only when the project server answers', async () => {
  const data = { releases: [rec({ id: 'firefox-161', family: 'firefox', version: '161', status: 'scheduled', date: '2026-11-24', summary: 's', sources: [] }), ff159] };
  const none = await enrichLinks(structuredClone(data), [], async () => false);
  assert.deepEqual(none, []);
  const d = structuredClone(data);
  const added = await enrichLinks(d, [], async (u) => u.includes('161.0beta'));
  assert.equal(added.length, 1);
  assert.equal(d.releases[0].sources[0].url, 'https://www.mozilla.org/en-US/firefox/161.0beta/releasenotes/');
  const rel = structuredClone({ releases: [ff159] });
  await enrichLinks(rel, ['firefox-159'], async () => true);
  assert.equal(rel.releases[0].notes.url, 'https://www.mozilla.org/en-US/firefox/159.0/releasenotes/');
});

test('index queue: forecasts first by soonest date, then released newest first; thin and missed pages left out', async () => {
  const { indexQueue } = await import('../updater/queue.js');
  const full = { codename: null, milestones: [], sources: [{ label: 'x', url: 'https://x.org' }], summary: 'A summary that is clearly longer than forty characters.' };
  const ev = [{ date: '2026-11-01', kind: 'official', text: 'a' }, { date: '2026-11-02', kind: 'estimate', text: 'b' }];
  const list = [
    { ...full, id: 'a-1', family: 'a', slug: '1', version: '1', status: 'released', date: '2026-10-01', evidence: ev },
    { ...full, id: 'a-3', family: 'a', slug: '3', version: '3', status: 'scheduled', date: '2026-12-01', evidence: ev },
    { ...full, id: 'a-2', family: 'a', slug: '2', version: '2', status: 'scheduled', date: '2026-11-10', evidence: ev },
    { ...full, id: 'a-9', family: 'a', slug: '9', version: '9', status: 'predicted', window: { start: '2026-11-20', end: '2026-11-27' }, evidence: [ev[0]] },
    { ...full, id: 'a-0', family: 'a', slug: '0', version: '0', status: 'predicted', window: { start: '2026-01-01', end: '2026-01-07' }, evidence: ev },
  ];
  assert.deepEqual(indexQueue(list, day('2026-11-04')).map((x) => x.path), ['/a/2/', '/a/3/', '/a/1/']);
});
