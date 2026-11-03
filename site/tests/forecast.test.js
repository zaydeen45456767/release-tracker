import test from 'node:test';
import assert from 'node:assert/strict';
import { effectiveStatus, headline, isIndexable, parseDay, daysBetween, formatWindow, gradeForecast } from '../src/lib/forecast.js';

const day = (s) => parseDay(s);

const predicted = {
  status: 'predicted',
  window: { start: '2026-12-20', end: '2026-12-27' },
  summary: 'A summary that is clearly longer than forty characters.',
  sources: [{ label: 'x', url: 'https://x.test' }],
  evidence: [{}, {}],
};

test('predicted inside window reads as expected now', () => {
  assert.match(headline(predicted, day('2026-12-22')), /^Expected now/);
});

test('predicted before window shows the window', () => {
  assert.match(headline(predicted, day('2026-11-03')), /^Expected Dec 20-27, 2026/);
});

test('passed window within 30 days is overdue, not missed', () => {
  assert.equal(effectiveStatus(predicted, day('2027-01-05')), 'predicted');
  assert.match(headline(predicted, day('2027-01-05')), /^Overdue/);
});

test('forecast 30+ days past its window becomes missed and is kept', () => {
  assert.equal(effectiveStatus(predicted, day('2027-02-01')), 'missed');
});

test('scheduled release shows countdown', () => {
  const r = { status: 'scheduled', date: '2027-04-22' };
  assert.match(headline(r, day('2027-04-21')), /tomorrow/);
});

test('released release is never shown as upcoming', () => {
  const r = { status: 'released', date: '2026-10-15' };
  assert.equal(effectiveStatus(r, day('2026-11-03')), 'released');
  assert.match(headline(r, day('2026-11-03')), /^Released/);
});

test('forecast with one piece of evidence stays out of search engines', () => {
  assert.equal(isIndexable({ ...predicted, evidence: [{}] }), false);
  assert.equal(isIndexable(predicted), true);
});

test('page with no sources stays out of search engines', () => {
  assert.equal(isIndexable({ ...predicted, sources: [] }), false);
});

test('window formatting and day math', () => {
  assert.equal(formatWindow({ start: '2026-12-20', end: '2026-12-27' }), 'Dec 20-27, 2026');
  assert.equal(daysBetween(day('2026-11-03'), day('2026-11-10')), 7);
});

test('kept forecast is graded against the real release date', () => {
  const forecast = { status: 'predicted', window: { start: '2026-11-03', end: '2026-11-17' }, chance: 70 };
  assert.deepEqual(gradeForecast({ status: 'released', date: '2026-11-03', forecast }), { hit: true, daysOff: 0 });
  assert.deepEqual(gradeForecast({ status: 'released', date: '2026-11-20', forecast }), { hit: false, daysOff: 3 });
  assert.deepEqual(gradeForecast({ status: 'released', date: '2026-11-01', forecast }), { hit: false, daysOff: -2 });
  assert.equal(gradeForecast({ status: 'released', date: '2027-03-17', forecast: { status: 'scheduled', date: '2027-03-17' } }), null);
});
