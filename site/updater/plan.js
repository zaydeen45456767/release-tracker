// Creates and refreshes pages from official schedules and feed signals. Pure: no network, no files.
//
// Created automatically (each page says what it is based on; `auto: true` marks it):
//   - a `scheduled` page for a version the project's own calendar lists (Firefox, from Mozilla)
//   - a `predicted` page for a kernel release candidate (window from the rc1 date and rc count),
//     and for a Fedora or GNOME version the project already shows in development (window from the usual gap)
//   - a `released` page for a newer version a feed shows as released with a real release day
// Kept in sync automatically:
//   - a scheduled date or milestone that the project's calendar moves (the first date stays under `firstPublished`)
//   - the kernel window as release candidates arrive
//   - "is the current/newest version" text on an older page once a newer release is out
// A run never creates more than MAX_NEW_PAGES pages, so a feed glitch cannot flood the site.
import { daysBetween, formatDay, parseDay } from '../src/lib/forecast.js';
import { addDays, compareVersions, evidenceKey, longDay, moveDateInText, pickDate, weekday } from './util.js';

export const MAX_NEW_PAGES = 5;
const CADENCE = { fedora: { days: 182, spread: 21 }, gnome: { days: 182, spread: 14 } };
const RECENT_RELEASE_DAYS = 120;

const slugOf = (v) => String(v).replace(/\./g, '-');
const midpoint = (w) => addDays(w.start, Math.round(daysBetween(parseDay(w.start), parseDay(w.end)) / 2));
const anchorDay = (r) => r.date ?? midpoint(r.window);

function newestReleased(data, family) {
  return data.releases.filter((r) => r.family === family && r.status === 'released').sort((a, b) => compareVersions(b.version, a.version))[0] ?? null;
}

function newestVersion(data, family) {
  return data.releases.filter((r) => r.family === family).map((r) => r.version).sort(compareVersions).at(-1) ?? null;
}

function addEvidence(record, item) {
  if (item.key && record.evidence.some((e) => e.key === item.key)) return false;
  record.evidence.push(item);
  return true;
}

function newPage(ctx, fields) {
  const { data } = ctx;
  const prev = newestReleased(data, fields.family);
  const slug = slugOf(fields.version);
  const record = { id: `${fields.family}-${slug}`, codename: null, slug, milestones: [], ...fields, auto: true };
  if (prev) record.useNow = prev.id;
  data.releases.push(record);
  ctx.created += 1;
  ctx.touched.add(record.id);
  return record;
}

// ---- official schedules (Mozilla) -------------------------------------------------------

export function planFromSchedule(planned, ctx) {
  const { data, review, title, nowDay } = ctx;
  for (const o of planned) {
    if (o.date < nowDay) continue; // a past date is the release flip's job
    const rec = data.releases.find((r) => r.family === o.family && r.version === o.version);
    if (rec) {
      if (rec.status !== 'released') syncSchedule(rec, o, ctx);
      continue;
    }
    const known = newestVersion(data, o.family);
    if (known && compareVersions(o.version, known) <= 0) continue; // never back-fill the past
    const prev = newestReleased(data, o.family);
    const t = `${ctx.familyName(o.family)} ${o.version}`;
    if (prev && o.date <= prev.date) {
      review(`${t}: ${o.source.label} gives ${o.date}, which is not after ${prev.version} (${prev.date}). Page not created.`);
      continue;
    }
    if (ctx.created >= MAX_NEW_PAGES) continue;
    newPage(ctx, {
      family: o.family,
      version: o.version,
      status: 'scheduled',
      date: o.date,
      summary: `${t} is scheduled for ${weekday(o.date)} ${longDay(o.date)}, according to the project's official release calendar.`,
      milestones: (o.milestones ?? []).map((m) => ({ ...m })),
      evidence: [{ date: nowDay, kind: 'official', key: `${o.sourceId}:${o.version}:${o.date}`, text: `${o.source.label} lists ${t} for release on ${longDay(o.date)}.` }],
      sources: [{ ...o.source }],
    });
    ctx.change(`${o.family}-${slugOf(o.version)}: new page created from ${o.source.label} (scheduled ${o.date})`);
  }
}

function syncSchedule(rec, o, ctx) {
  const { review, title, nowDay } = ctx;
  const t = title(rec);
  const source = { ...o.source };
  if (rec.status === 'predicted') {
    // An official date has been published: keep our estimate as the first forecast, then show the date.
    rec.firstPublished ??= { status: 'predicted', window: rec.window, chance: rec.chance, summary: rec.summary };
    rec.status = 'scheduled';
    rec.date = o.date;
    delete rec.window;
    delete rec.chance;
    rec.summary = `${t} is scheduled for ${weekday(o.date)} ${longDay(o.date)}, according to the project's official release calendar.`;
    addEvidence(rec, { date: nowDay, kind: 'official', key: `${o.sourceId}:${rec.version}:${o.date}`, text: `${o.source.label} now lists ${t} for release on ${longDay(o.date)}. Before that we only had an estimate.` });
    if (!rec.sources.some((s) => s.url === source.url)) rec.sources.push(source);
    ctx.change(`${rec.id}: official date published (${o.date}); forecast kept, page now scheduled`);
    ctx.touched.add(rec.id);
  } else if (rec.status === 'scheduled' && rec.date !== o.date) {
    if (Math.abs(daysBetween(parseDay(rec.date), parseDay(o.date))) > 90) {
      review(`${t}: ${o.source.label} moved the date from ${rec.date} to ${o.date}, more than 90 days. Not applied.`);
      return;
    }
    rec.firstPublished ??= { status: 'scheduled', date: rec.date, summary: rec.summary };
    const old = rec.date;
    rec.date = o.date;
    rec.summary = moveDateInText(rec.summary, old, o.date);
    if (!rec.summary.includes(longDay(o.date))) review(`${t}: date moved to ${longDay(o.date)} but the summary does not say so. Edit the summary.`);
    addEvidence(rec, { date: nowDay, kind: 'official', key: `${o.sourceId}:${rec.version}:${o.date}`, text: `${o.source.label} moved ${t} from ${longDay(old)} to ${longDay(o.date)}.` });
    ctx.change(`${rec.id}: official date moved ${old} -> ${o.date} (${o.source.label}); first date kept`);
    ctx.touched.add(rec.id);
  }
  let refreshed = false;
  for (const m of o.milestones ?? []) {
    const have = rec.milestones.find((x) => x.label === m.label);
    if (!have) {
      rec.milestones.push({ ...m });
      refreshed = true;
    } else if (have.date !== m.date) {
      have.date = m.date;
      refreshed = true;
    }
  }
  if (refreshed) {
    rec.milestones.sort((a, b) => a.date.localeCompare(b.date));
    ctx.change(`${rec.id}: milestone dates refreshed from ${o.source.label}`);
  }
}

// ---- kernel release candidates ----------------------------------------------------------

// Linux ships the week after its last release candidate. A normal cycle ends after rc7 (49 days after rc1);
// each extra rc pushes the final release back a week.
export function kernelWindow(rc1, latestRc) {
  const n = Math.max(7, latestRc);
  return { start: addDays(rc1, 7 * n), end: addDays(rc1, 7 * n + 7) };
}

function rcInfo(vObs) {
  const rcs = vObs.filter((o) => o.kind === 'prerelease' && /^rc\d+$/.test(o.label ?? '') && o.date);
  if (!rcs.length) return null;
  const num = (o) => Number(o.label.slice(2));
  const first = rcs.reduce((a, b) => (num(b) < num(a) ? b : a));
  const last = rcs.reduce((a, b) => (num(b) > num(a) ? b : a));
  return { rc1: addDays(first.date, -7 * (num(first) - 1)), latest: num(last), latestDate: last.date, rcs };
}

const kernelSummary = (t, info, w) =>
  `${t} is in the release candidate stage (rc${info.latest} was tagged on ${longDay(info.latestDate)}). We expect the final release between ${longDay(w.start)} and ${longDay(w.end)}, the usual spread after the last release candidate.`;

export function refreshKernel(obs, ctx) {
  const { data, title, nowDay } = ctx;
  for (const rec of data.releases.filter((r) => r.family === 'linux-kernel' && r.status === 'predicted')) {
    const info = rcInfo(obs.filter((o) => o.family === 'linux-kernel' && o.version === rec.version));
    if (!info) continue;
    const w = kernelWindow(info.rc1, info.latest);
    if (rec.window.start === w.start && rec.window.end === w.end) continue;
    rec.firstPublished ??= { status: 'predicted', window: rec.window, chance: rec.chance, summary: rec.summary };
    rec.window = w;
    if (rec.auto) rec.summary = kernelSummary(title(rec), info, w);
    addEvidence(rec, {
      date: nowDay,
      kind: 'estimate',
      key: `kernel-window:${rec.version}:${w.start}`,
      text: `With rc${info.latest} tagged, Linux normally ships the week after the last release candidate, so we now expect ${longDay(w.start)} to ${longDay(w.end)}.`,
    });
    ctx.change(`${rec.id}: window moved to ${w.start} - ${w.end} after rc${info.latest}`);
    ctx.touched.add(rec.id);
  }
}

// ---- versions a feed shows that we have no page for -------------------------------------

function createReleased(family, version, vObs, ctx) {
  const picked = pickDate({ status: 'predicted' }, vObs.filter((o) => o.kind === 'release'));
  if (!picked) return false;
  const { date, obs } = picked;
  if (daysBetween(parseDay(date), ctx.now) > RECENT_RELEASE_DAYS) return false;
  const prev = newestReleased(ctx.data, family.id);
  if (prev && date < prev.date) return false;
  const t = `${family.name} ${version}`;
  const codename = obs.codename ?? vObs.find((o) => o.codename)?.codename ?? null;
  newPage(ctx, {
    family: family.id,
    version,
    codename,
    status: 'released',
    date,
    summary: `${t}${codename ? ` "${codename}"` : ''} was released on ${longDay(date)}. ${obs.source.label} lists it as released.`,
    milestones: [{ label: 'Final release', date }],
    evidence: [{ date, kind: obs.official ? 'official' : 'report', key: `${obs.sourceId}:${version}-released`, text: `${obs.source.label} lists ${t} as released on ${longDay(date)}.` }],
    sources: [{ ...obs.source }],
  });
  ctx.change(`${family.id}-${slugOf(version)}: new released page created (${date}, from ${obs.source.label})`);
  return true;
}

function createKernel(family, version, vObs, ctx) {
  const info = rcInfo(vObs);
  if (!info) return false;
  const t = `${family.name} ${version}`;
  const w = kernelWindow(info.rc1, info.latest);
  if (w.end < ctx.nowDay) return false;
  const rec = newPage(ctx, {
    family: family.id,
    version,
    status: 'predicted',
    window: w,
    chance: 75,
    summary: kernelSummary(t, info, w),
    milestones: [{ label: 'rc1', date: info.rc1 }, { label: 'rc7 (expected)', date: addDays(info.rc1, 42) }],
    evidence: [],
    sources: [{ ...info.rcs[0].source }],
  });
  for (const o of info.rcs) addEvidence(rec, { date: o.date, kind: 'official', key: evidenceKey(o), text: `${t} ${o.label} was tagged on ${formatDay(o.date)} (${o.source.label}).` });
  addEvidence(rec, { date: ctx.nowDay, kind: 'estimate', key: `kernel-window:${version}:${w.start}`, text: `A normal cycle ends after rc7, 49 days after rc1 (${longDay(info.rc1)}); an rc8 adds a week. That gives ${longDay(w.start)} to ${longDay(w.end)}.` });
  ctx.change(`${rec.id}: new page created from kernel.org release candidates (window ${w.start} - ${w.end})`);
  return true;
}

function createCadence(family, version, vObs, ctx) {
  const { days, spread } = CADENCE[family.id];
  const earlier = ctx.data.releases.filter((r) => r.family === family.id && compareVersions(r.version, version) < 0).sort((a, b) => compareVersions(b.version, a.version));
  const before = earlier[0];
  if (!before) return false;
  const base = anchorDay(before);
  const w = { start: addDays(base, days - spread), end: addDays(base, days + spread) };
  if (w.end < ctx.nowDay) return false;
  const t = `${family.name} ${version}`;
  const src = vObs[0].source;
  const rec = newPage(ctx, {
    family: family.id,
    version,
    status: 'predicted',
    window: w,
    chance: 60,
    summary: `${t} has no official release date yet. ${src.label} already shows it in development. Based on the usual gap of about six months between releases, we expect it between ${longDay(w.start)} and ${longDay(w.end)}.`,
    evidence: [],
    sources: [{ ...src }],
  });
  addEvidence(rec, { date: ctx.nowDay, kind: 'estimate', key: `cadence:${family.id}:${version}`, text: `We found no official ${t} date. The window is the usual six-month gap after ${family.name} ${before.version} (${longDay(base)}), plus allowance for slips.` });
  ctx.change(`${rec.id}: new page created from ${src.label} (estimated window ${w.start} - ${w.end})`);
  return true;
}

export function draftUnknown(obs, ctx) {
  const { data, review } = ctx;
  for (const family of data.families) {
    const records = data.releases.filter((r) => r.family === family.id);
    const newest = newestVersion(data, family.id);
    const versions = [...new Set(obs.filter((o) => o.family === family.id && o.version).map((o) => o.version))]
      .filter((v) => !records.some((r) => r.version === v) && (!newest || compareVersions(v, newest) > 0))
      .sort(compareVersions);
    for (const v of versions) {
      const vObs = obs.filter((o) => o.family === family.id && o.version === v);
      let made = false;
      if (ctx.created < MAX_NEW_PAGES) {
        if (vObs.some((o) => o.kind === 'release')) made = createReleased(family, v, vObs, ctx);
        else if (family.id === 'linux-kernel') made = createKernel(family, v, vObs, ctx);
        else if (CADENCE[family.id]) made = createCadence(family, v, vObs.filter((o) => o.kind !== 'codename'), ctx);
      }
      if (!made) {
        for (const o of vObs) review(`New: ${family.name} ${o.version} seen in ${o.source.label} (${o.kind}${o.label ? ` ${o.label}` : ''}). We have no page for it.`);
      }
    }
  }
}

// ---- stale "current version" text -------------------------------------------------------

const CURRENT = /\b(?:is|are) the (?:current|newest|latest)\b|\breplaces it\b/i;
const LTS = /\bLTS\b|long-term support/i;
const lts = (r) => r.lts === true || LTS.test(r.summary);

export function supersede(ctx) {
  const { data, title } = ctx;
  for (const family of data.families) {
    const newest = newestReleased(data, family.id);
    if (!newest) continue;
    for (const r of data.releases.filter((x) => x.family === family.id && x.status === 'released' && x.id !== newest.id && compareVersions(x.version, newest.version) < 0)) {
      if (!CURRENT.test(r.summary)) continue;
      if (lts(r) && !lts(newest)) continue; // an LTS stays "the current LTS" when a normal release follows it
      r.summary = `${title(r)} was released on ${longDay(r.date)}. ${title(newest)} replaced it as the newest version on ${longDay(newest.date)}.`;
      ctx.change(`${r.id}: summary no longer says "current" (${title(newest)} is out)`);
      ctx.touched.add(r.id);
    }
  }
}
