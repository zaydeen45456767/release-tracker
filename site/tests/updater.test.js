import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFirefoxVersions, parseBodhi, parseDebianRelease, parseGnomeTags, parseKernelOrg, parseTextDate, parseUbuntuMetaRelease, observe, SOURCES } from '../updater/sources.js';
import { applyObservations, compareVersions } from '../updater/apply.js';
import { parseDay } from '../src/lib/forecast.js';

const day = (s) => parseDay(s);
const src = (id) => SOURCES.find((s) => s.id === id);

const families = [
  { id: 'fedora', name: 'Fedora' },
  { id: 'gnome', name: 'GNOME' },
  { id: 'linux-kernel', name: 'Linux kernel' },
  { id: 'linux-mint', name: 'Linux Mint' },
];

const fedora45 = {
  id: 'fedora-45', family: 'fedora', version: '45', codename: null, slug: '45', status: 'predicted',
  window: { start: '2026-11-03', end: '2026-11-17' }, chance: 70,
  summary: 'Fedora 45 has slipped past its first target date.', milestones: [], evidence: [], sources: [], useNow: 'fedora-44',
};
const fedora44 = {
  id: 'fedora-44', family: 'fedora', version: '44', codename: null, slug: '44', status: 'released', date: '2026-05-01',
  summary: 'Fedora 44.', milestones: [], evidence: [], sources: [],
};
const fedora46 = { ...fedora45, id: 'fedora-46', version: '46', slug: '46', window: { start: '2027-04-15', end: '2027-05-15' } };
const gnome52 = {
  id: 'gnome-52', family: 'gnome', version: '52', codename: null, slug: '52', status: 'scheduled', date: '2027-03-17',
  summary: 'GNOME 52 is next.', milestones: [], evidence: [], sources: [],
};

const bodhiFeed = JSON.stringify({
  releases: [
    { name: 'F44', version: '44', state: 'current', released_on: '2026-04-28' },
    { name: 'F44F', version: '44', state: 'current', released_on: '2026-04-28' },
    { name: 'F45', version: '45', state: 'current', released_on: '2026-11-03' },
    { name: 'F46', version: '46', state: 'pending', released_on: null },
    { name: 'EPEL-10', version: '10', state: 'current', released_on: '2025-01-01' },
  ],
});

test('feed dates in text form are parsed', () => {
  assert.equal(parseTextDate('Thu, 23 April 2026 00:26:04 UTC'), '2026-04-23');
  assert.equal(parseTextDate('Debian 13.7 Released 12 September 2026'), '2026-09-12');
  assert.equal(parseTextDate('no date here'), null);
});

test('kernel.org: rc is a prerelease, bare mainline version is a dated release, point release proves release only', () => {
  const feed = JSON.stringify({
    releases: [
      { moniker: 'mainline', version: '7.4-rc1', released: { isodate: '2026-11-01' } },
      { moniker: 'stable', version: '7.3.1', released: { isodate: '2026-10-30' } },
      { moniker: 'mainline', version: '7.5', released: { isodate: '2027-02-28' } },
      { moniker: 'linux-next', version: 'next-20261102', released: { isodate: '2026-11-02' } },
    ],
  });
  assert.deepEqual(parseKernelOrg(feed), [
    { kind: 'prerelease', version: '7.4', label: 'rc1', date: '2026-11-01' },
    { kind: 'release', version: '7.3', date: null, dateIsRelease: false },
    { kind: 'release', version: '7.5', date: '2027-02-28', dateIsRelease: true },
  ]);
});

test('Bodhi: only Fedora releases, pending ones only "exist"', () => {
  const obs = parseBodhi(bodhiFeed);
  assert.equal(obs.filter((o) => o.version === '10').length, 0);
  assert.deepEqual(obs.find((o) => o.version === '46'), { kind: 'exists', version: '46', date: null });
  assert.equal(obs.find((o) => o.version === '45').date, '2026-11-03');
});

test('Ubuntu meta-release: point releases do not give a release date', () => {
  const feed = 'Dist: questing\nName: Questing Quokka\nVersion: 25.10\nDate: Thu, 09 October 2025 00:25:10 UTC\n\nDist: resolute\nName: Resolute Raccoon\nVersion: 26.04.1 LTS\nDate: Thu, 23 April 2026 00:26:04 UTC\n';
  const [a, b] = parseUbuntuMetaRelease(feed);
  assert.equal(a.version, '25.10');
  assert.equal(a.date, '2025-10-09');
  assert.equal(b.version, '26.04');
  assert.equal(b.date, null);
});

test('Debian: only x.0 gives a release date', () => {
  const point = parseDebianRelease('Version: 13.7\nCodename: trixie\nDescription: Debian 13.7 Released 12 September 2026\n');
  assert.equal(point[0].version, '13');
  assert.equal(point[0].date, null);
  const first = parseDebianRelease('Version: 14.0\nCodename: forky\nDescription: Debian 14.0 Released 10 July 2027\n');
  assert.equal(first[0].date, '2027-07-10');
});

test('GNOME tags: alpha/beta/rc are prereleases; x.0 tag date is not a release date', () => {
  const feed = JSON.stringify([
    { name: '52.alpha', commit: { committed_date: '2027-01-09T12:00:00.000+01:00' } },
    { name: '52.0', commit: { committed_date: '2027-03-15T12:00:00.000+01:00' } },
  ]);
  const [pre, rel] = parseGnomeTags(feed);
  assert.deepEqual(pre, { kind: 'prerelease', version: '52', label: 'alpha', date: '2027-01-09' });
  assert.equal(rel.dateIsRelease, false);
});

test('version compare is numeric', () => {
  assert.ok(compareVersions('7.10', '7.9') > 0);
  assert.ok(compareVersions('26.04', '26.10') < 0);
  assert.equal(compareVersions('45', '45'), 0);
});

test('predicted release flips with an official date, keeps the forecast, moves "use now"', () => {
  const data = { updated: '2026-11-01', families, releases: [fedora45, fedora44, fedora46] };
  const { data: out, changes } = applyObservations(data, observe(src('bodhi'), bodhiFeed), day('2026-11-03'));
  const r = out.releases.find((x) => x.id === 'fedora-45');
  assert.equal(r.status, 'released');
  assert.equal(r.date, '2026-11-03');
  assert.equal(r.window, undefined);
  assert.deepEqual(r.forecast.window, { start: '2026-11-03', end: '2026-11-17' });
  assert.equal(r.forecast.chance, 70);
  assert.equal(r.forecast.summary, fedora45.summary);
  assert.match(r.summary, /^Fedora 45 was released on Nov 3, 2026\./);
  assert.equal(r.evidence.at(-1).kind, 'official');
  assert.equal(out.releases.find((x) => x.id === 'fedora-46').useNow, 'fedora-45');
  assert.equal(out.updated, '2026-11-03');
  assert.ok(changes.length >= 2);
  // the input is not modified
  assert.equal(fedora45.status, 'predicted');
});

test('a feed date in the future does not flip anything', () => {
  const data = { updated: '2026-11-01', families, releases: [fedora45, fedora44] };
  const { data: out, changes } = applyObservations(data, observe(src('bodhi'), bodhiFeed), day('2026-11-02'));
  assert.equal(out.releases.find((x) => x.id === 'fedora-45').status, 'predicted');
  assert.ok(!changes.some((c) => /flipped/.test(c)));
});

test('our date for a released version is never overwritten, only flagged', () => {
  const data = { updated: '2026-11-01', families, releases: [fedora44] };
  const { data: out, reviews } = applyObservations(data, observe(src('bodhi'), bodhiFeed), day('2026-11-03'));
  assert.equal(out.releases[0].date, '2026-05-01');
  assert.ok(reviews.some((t) => /our date is 2026-05-01.*2026-04-28/.test(t)));
});

test('scheduled release: final tag near the schedule uses the scheduled date; far off goes to review', () => {
  const tag = (d) => observe(src('gnome-shell-tags'), JSON.stringify([{ name: '52.0', commit: { committed_date: `${d}T12:00:00Z` } }]));
  const near = applyObservations({ families, releases: [gnome52] }, tag('2027-03-15'), day('2027-03-17'));
  assert.equal(near.data.releases[0].status, 'released');
  assert.equal(near.data.releases[0].date, '2027-03-17');
  assert.match(near.data.releases[0].summary, /on its scheduled date/);

  const far = applyObservations({ families, releases: [gnome52] }, tag('2027-04-20'), day('2027-04-21'));
  assert.equal(far.data.releases[0].status, 'scheduled');
  assert.ok(far.reviews.some((t) => /no feed gives a release date/.test(t)));
});

test('prerelease evidence is added once, even on repeat runs', () => {
  const kernel74 = {
    id: 'linux-kernel-7-4', family: 'linux-kernel', version: '7.4', codename: null, slug: '7-4', status: 'predicted',
    window: { start: '2026-12-20', end: '2026-12-27' }, chance: 80, summary: 's', milestones: [], evidence: [], sources: [],
  };
  const feed = JSON.stringify({ releases: [{ moniker: 'mainline', version: '7.4-rc1', released: { isodate: '2026-11-01' } }] });
  const obs = observe(src('kernel-org'), feed);
  const first = applyObservations({ families, releases: [kernel74] }, obs, day('2026-11-03'));
  assert.equal(first.data.releases[0].evidence.length, 1);
  assert.equal(first.data.releases[0].status, 'predicted');
  const second = applyObservations(first.data, obs, day('2026-11-04'));
  assert.equal(second.data.releases[0].evidence.length, 1);
  assert.equal(second.changes.length, 0);
});

test('codename match with a different version number is not flipped', () => {
  const mint = {
    id: 'linux-mint-27', family: 'linux-mint', version: '27', codename: 'Adrien', slug: '27', status: 'predicted',
    window: { start: '2026-12-20', end: '2027-01-31' }, chance: 50, summary: 's', milestones: [], evidence: [], sources: [],
  };
  const feed = JSON.stringify([{ cycle: '23', codename: 'Adrien', releaseDate: '2026-12-22' }]);
  const { data: out, reviews } = applyObservations({ families, releases: [mint] }, observe(src('eol-linuxmint'), feed), day('2027-01-02'));
  assert.equal(out.releases[0].status, 'predicted');
  assert.ok(reviews.some((t) => /version 23, not 27/.test(t)));
});

test('a newer version with no page: Fedora gets a page, a family without a strategy is reported; older ones are ignored', () => {
  const { data: out, reviews } = applyObservations({ families, releases: [fedora44, fedora45] }, observe(src('bodhi'), bodhiFeed), day('2026-11-03'));
  const f46 = out.releases.find((r) => r.id === 'fedora-46');
  assert.equal(f46.status, 'predicted');
  assert.equal(f46.auto, true);
  assert.ok(!reviews.some((t) => /New: Fedora 4[36]/.test(t)));
  const mint = observe(src('eol-linuxmint'), JSON.stringify([{ cycle: '23', releaseDate: '2027-01-01', codename: 'x' }]));
  const { reviews: r2 } = applyObservations({ families, releases: [] }, [{ ...mint[0], kind: 'exists', date: null }], day('2026-11-03'));
  assert.ok(r2.some((t) => /New: Linux Mint 23/.test(t)));
});

test('version history: official dates win, aggregator fills support dates, existing entries are kept', async () => {
  const { buildHistory } = await import('../updater/history.js');
  const eol = observe(src('eol-fedora'), JSON.stringify([
    { cycle: '44', releaseDate: '2026-04-29', eol: '2027-06-02', latest: '44', lts: false },
    { cycle: '47', releaseDate: '2027-10-01', eol: '2028-11-01' },
  ]));
  const bodhi = observe(src('bodhi'), bodhiFeed);
  const prev = { gnome: [{ version: '51', released: '2026-09-16', source: 'GNOME release notes' }] };
  const h = buildHistory(prev, [...eol, ...bodhi], day('2026-11-03'));
  const f44 = h.fedora.find((e) => e.version === '44');
  assert.equal(f44.released, '2026-04-28'); // Bodhi (official) beats endoflife.date
  assert.equal(f44.eol, '2027-06-02');
  assert.equal(f44.latest, undefined); // "44" is not a point release
  assert.ok(!h.fedora.some((e) => e.version === '47')); // future date ignored
  assert.ok(!h.fedora.some((e) => e.version === '46')); // pending, no release date
  assert.deepEqual(h.gnome, prev.gnome);
});

test('Mozilla product details: current version is a dated release, beta has no date', () => {
  const obs = parseFirefoxVersions(JSON.stringify({ LATEST_FIREFOX_VERSION: '160.0', LAST_RELEASE_DATE: '2026-11-10', LATEST_FIREFOX_RELEASED_DEVEL_VERSION: '161.0b1' }));
  assert.deepEqual(obs[0], { kind: 'release', version: '160', date: '2026-11-10', dateIsRelease: true });
  assert.deepEqual(obs[1], { kind: 'prerelease', version: '161', label: 'beta 1', date: null });
  assert.equal(parseFirefoxVersions(JSON.stringify({ LATEST_FIREFOX_VERSION: '159.0.1' })).length, 0);
});
