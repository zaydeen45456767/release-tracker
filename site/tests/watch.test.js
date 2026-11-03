import test from 'node:test';
import assert from 'node:assert/strict';
import { hotReleases } from '../updater/watch.js';
import { parseDay } from '../src/lib/forecast.js';

const scheduled = { family: 'x', version: '1', status: 'scheduled', date: '2026-11-10' };
const narrow = { family: 'y', version: '2', status: 'predicted', window: { start: '2026-12-20', end: '2026-12-27' } };
const wide = { family: 'z', version: '3', status: 'predicted', window: { start: '2027-06-01', end: '2027-09-30' } };
const out = { family: 'w', version: '4', status: 'released', date: '2026-11-10' };
const hot = (day) => hotReleases([scheduled, narrow, wide, out], parseDay(day)).map((r) => r.family);

test('exact date: hot from 2 days before to 3 days after', () => {
  assert.deepEqual(hot('2026-11-07'), []);
  assert.deepEqual(hot('2026-11-08'), ['x']);
  assert.deepEqual(hot('2026-11-13'), ['x']);
  assert.deepEqual(hot('2026-11-14'), []);
});

test('narrow window is hot around it; wide window and released never are', () => {
  assert.deepEqual(hot('2026-12-18'), ['y']);
  assert.deepEqual(hot('2026-12-30'), ['y']);
  assert.deepEqual(hot('2027-07-01'), []);
});
