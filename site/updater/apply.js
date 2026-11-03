// Turns feed observations into data changes. Pure: no network, no files.
//
// Applied automatically (safe, sourced facts):
//   - flip a predicted/scheduled release to `released` when a feed lists it with a usable date,
//     keeping the forecast exactly as published under `forecast`
//   - point "waiting for X? use Y now" at the newest released version
//   - add prerelease milestones (kernel rc, GNOME alpha/beta/rc) to the evidence timeline
// Left for the owner to review (never applied):
//   - a release seen without a trustworthy date, or a date that fails the sanity checks
//   - our date for a released version disagreeing with a feed
//   - a codename match with a different version number
//   - versions or codenames in feeds that we have no page for
//   - a scheduled date that passed with no release seen
import { daysBetween, formatDay, parseDay } from '../src/lib/forecast.js';

export function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

const lower = (s) => (s ?? '').toLowerCase();

// Ubuntu codenames come as "Tenacious T-Rex" in our data but feeds may differ in case.
function sameCodename(record, obs) {
  return Boolean(record.codename && obs.codename) && lower(obs.codename).startsWith(lower(record.codename).split(' ')[0]);
}

function evidenceKey(obs) {
  return `${obs.sourceId}:${obs.version}${obs.label ? `-${obs.label}` : ''}`;
}

function addSource(record, src) {
  if (!record.sources.some((s) => s.url === src.url)) record.sources.push({ ...src });
}

// Choose the release day: an official release-day date, then an aggregator's, then (for
// scheduled releases only) the project's own scheduled date if the final tag landed within a week of it.
function pickDate(record, seen) {
  const dated = seen.filter((o) => o.date && o.dateIsRelease);
  const pick = dated.find((o) => o.official) ?? dated[0];
  if (pick) return { date: pick.date, obs: pick, dated };
  if (record.status === 'scheduled') {
    const tag = seen.find((o) => o.date);
    if (tag && Math.abs(daysBetween(parseDay(record.date), parseDay(tag.date))) <= 7) {
      return { date: record.date, obs: tag, dated, viaSchedule: true };
    }
  }
  return null;
}

export function applyObservations(input, observations, now) {
  const data = structuredClone(input);
  const changes = [];
  const reviews = [];
  const review = (text) => reviews.includes(text) || reviews.push(text);
  const familyName = (id) => data.families.find((f) => f.id === id)?.name ?? id;
  const title = (r) => `${familyName(r.family)} ${r.version}`;
  const nowDay = now.toISOString().slice(0, 10);

  // A feed date in the future means "not out yet" (endoflife.date lists some releases early).
  const obs = observations.filter((o) => !o.date || parseDay(o.date) <= now);

  for (const record of data.releases) {
    const forFamily = obs.filter((o) => o.family === record.family);
    const byVersion = forFamily.filter((o) => o.version === record.version);
    const releasedObs = byVersion.filter((o) => o.kind === 'release');

    const byCodenameOnly = forFamily.filter((o) => o.kind === 'release' && o.version && o.version !== record.version && sameCodename(record, o));
    for (const o of byCodenameOnly) {
      review(`${title(record)}: ${o.source.label} lists codename "${o.codename}" as version ${o.version}, not ${record.version}. Check the page name.`);
    }

    if (record.status === 'released') {
      for (const o of releasedObs.filter((x) => x.date && x.dateIsRelease && x.date !== record.date)) {
        review(`${title(record)}: our date is ${record.date}, ${o.source.label} says ${o.date}. Not changed automatically.`);
      }
      continue;
    }

    // Prerelease milestones go on the evidence timeline once each.
    for (const o of byVersion.filter((x) => x.kind === 'prerelease' && x.date)) {
      const key = evidenceKey(o);
      if (record.evidence.some((e) => e.key === key)) continue;
      record.evidence.push({ date: o.date, kind: 'official', key, text: `${title(record)} ${o.label} was tagged on ${formatDay(o.date)} (${o.source.label}).` });
      addSource(record, o.source);
      changes.push(`${record.id}: added ${o.label} (${o.date}) to the evidence`);
    }

    if (releasedObs.length === 0) {
      if (record.status === 'scheduled' && daysBetween(parseDay(record.date), now) > 2) {
        review(`${title(record)}: scheduled for ${record.date} but no feed shows it released yet.`);
      }
      continue;
    }

    const picked = pickDate(record, releasedObs);
    if (!picked) {
      review(`${title(record)}: ${releasedObs[0].source.label} shows it released, but no feed gives a release date. Set the date by hand.`);
      continue;
    }
    const { date, viaSchedule } = picked;
    for (const o of picked.dated.filter((x) => Math.abs(daysBetween(parseDay(x.date), parseDay(date))) > 2)) {
      review(`${title(record)}: release date sources disagree (${date} used, ${o.source.label} says ${o.date}).`);
    }
    const previous = data.releases
      .filter((r) => r.family === record.family && r.status === 'released' && compareVersions(r.version, record.version) < 0)
      .map((r) => r.date)
      .sort()
      .at(-1);
    if (previous && date < previous) {
      review(`${title(record)}: feed date ${date} is before the previous release (${previous}). Not applied.`);
      continue;
    }

    // Keep the forecast exactly as published, then flip.
    const forecast = { status: record.status, summary: record.summary };
    for (const k of ['date', 'window', 'chance']) if (record[k] !== undefined) forecast[k] = record[k];
    record.forecast = forecast;
    record.status = 'released';
    record.date = date;
    delete record.window;
    delete record.chance;
    const onSchedule = forecast.status === 'scheduled' && forecast.date === date;
    record.summary =
      `${title(record)} was released on ${formatDay(date)}` +
      (onSchedule ? ', on its scheduled date.' : '.') +
      (forecast.status === 'predicted' ? ' Our forecast from before the release is kept on this page for the record.' : '');
    const src = picked.obs.source;
    record.evidence.push({
      date,
      kind: picked.obs.official ? 'official' : 'report',
      key: `${picked.obs.sourceId}:${record.version}-released`,
      text: viaSchedule
        ? `The final ${record.version} tag appeared (${src.label}), matching the scheduled release on ${formatDay(date)}.`
        : `${src.label} lists ${title(record)} as released on ${formatDay(date)}.`,
    });
    addSource(record, src);
    if (!record.milestones.some((m) => m.label === 'Final release')) record.milestones.push({ label: 'Final release', date });
    changes.push(`${record.id}: flipped to released (${date}, from ${src.label})`);
  }

  // "Waiting for X? use Y now" should point at the newest released version.
  for (const family of data.families) {
    const newest = data.releases
      .filter((r) => r.family === family.id && r.status === 'released')
      .sort((a, b) => compareVersions(b.version, a.version))[0];
    if (!newest) continue;
    for (const r of data.releases) {
      if (r.family === family.id && r.status !== 'released' && r.useNow && r.useNow !== newest.id) {
        changes.push(`${r.id}: "use now" link ${r.useNow} -> ${newest.id}`);
        r.useNow = newest.id;
      }
    }
  }

  // Versions and codenames the feeds know about that we have no page for.
  for (const family of data.families) {
    const records = data.releases.filter((r) => r.family === family.id);
    const newestKnown = records.map((r) => r.version).sort(compareVersions).at(-1);
    for (const o of obs.filter((x) => x.family === family.id && x.version)) {
      if (records.some((r) => r.version === o.version)) continue;
      if (newestKnown && compareVersions(o.version, newestKnown) <= 0) continue;
      review(`New: ${family.name} ${o.version} seen in ${o.source.label} (${o.kind}${o.label ? ` ${o.label}` : ''}). We have no page for it.`);
    }
    const codenames = obs.filter((x) => x.family === family.id && x.kind === 'codename').map((x) => x);
    for (const r of records.filter((x) => x.status !== 'released' && x.codename)) {
      const hit = codenames.find((o) => o.codename === lower(r.codename));
      if (hit) review(`${title(r)}: codename "${hit.codename}" exists in ${hit.source.label}, which supports the name "${r.codename}".`);
    }
  }

  if (changes.length) data.updated = nowDay;
  return { data, changes, reviews };
}
