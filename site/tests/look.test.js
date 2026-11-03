import test from 'node:test';
import assert from 'node:assert/strict';
import { boardStatus, boardWhen, releaseStations, familyStations } from '../src/lib/look.js';
import { parseDay } from '../src/lib/forecast.js';

const day = (s) => parseDay(s);
const predicted = { status: 'predicted', window: { start: '2026-12-20', end: '2026-12-27' } };

test('status labels follow the forecast status', () => {
  assert.equal(boardStatus(predicted, day('2026-11-03')).word, 'Expected');
  assert.equal(boardStatus(predicted, day('2026-12-15')).word, 'This week');
  assert.equal(boardStatus(predicted, day('2026-12-22')).word, 'Due now');
  assert.equal(boardStatus(predicted, day('2027-01-05')).word, 'Overdue');
  assert.equal(boardStatus(predicted, day('2027-02-01')).word, 'Missed');
  assert.equal(boardStatus({ status: 'scheduled', date: '2027-04-22' }, day('2026-11-03')).word, 'Scheduled');
  assert.equal(boardStatus({ status: 'scheduled', date: '2027-04-22' }, day('2027-04-25')).word, 'Late');
  assert.equal(boardStatus({ status: 'released', date: '2026-10-15' }, day('2026-11-03')).word, 'Released');
});

test('short dates and never lose the year', () => {
  assert.equal(boardWhen({ date: '2027-04-22' }), '22 Apr 2027');
  assert.equal(boardWhen({ window: { start: '2026-12-20', end: '2026-12-27' } }), '20-27 Dec 2026');
  assert.equal(boardWhen({ window: { start: '2027-04-15', end: '2027-05-15' } }), '15 Apr-15 May 2027');
  assert.equal(boardWhen({ window: { start: '2026-12-20', end: '2027-01-31' } }), '20 Dec 26-31 Jan 27');
});

test('release line: previous release, milestones, "you are here" before the first future stop', () => {
  const all = [
    { id: 'k73', family: 'k', version: '7.3', status: 'released', date: '2026-10-18' },
    { id: 'k74', family: 'k', version: '7.4', status: 'predicted', window: { start: '2026-12-20', end: '2026-12-27' },
      milestones: [{ label: 'rc7 (expected)', date: '2026-12-13' }, { label: 'Merge window ends, rc1 (expected)', date: '2026-11-01' }] },
  ];
  const s = releaseStations(all[1], all, day('2026-11-03'));
  assert.deepEqual(s.map((x) => x.type === 'today' ? 'TODAY' : x.label), ['7.3 out', 'Merge window ends, rc1', 'TODAY', 'rc7', 'Release window']);
});

test('released line has no "you are here"; family line puts today between out and upcoming', () => {
  const r = { id: 'a', family: 'f', version: '1', status: 'released', date: '2026-10-01', milestones: [] };
  assert.ok(!releaseStations(r, [r], day('2026-11-03')).some((x) => x.type === 'today'));
  const fam = familyStations([{ ...r }, { id: 'b', family: 'f', version: '2', status: 'scheduled', date: '2027-04-01' }], day('2026-11-03'));
  assert.deepEqual(fam.map((x) => x.type), ['station', 'today', 'station']);
});
