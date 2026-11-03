// Version history per project: release date, support dates and latest point release.
// Built from the same feeds as the release checks. Pure; run.js saves it to src/data/history.json.
// Entries already in the file (for example GNOME, which has no support-date feed) are kept.
import { compareVersions } from './apply.js';

const KEEP = 12; // newest versions kept per project

export function buildHistory(previous, observations, now) {
  const nowDay = now.toISOString().slice(0, 10);
  const out = structuredClone(previous ?? {});
  for (const o of observations) {
    if (o.kind !== 'release' || !o.version || !/^\d+(\.\d+)?$/.test(o.version)) continue;
    if (o.date && o.date > nowDay) continue;
    const list = (out[o.family] ??= []);
    let e = list.find((x) => x.version === o.version);
    if (!e) {
      if (!o.date || !o.dateIsRelease) continue; // only add versions with a real release date
      e = { version: o.version };
      list.push(e);
    }
    // Official feeds win over aggregators for the release date; aggregators fill the gaps.
    if (o.date && o.dateIsRelease && (o.official || !e.released)) {
      e.released = o.date;
      e.source = o.source.label;
    }
    if (o.codename && !e.codename) e.codename = o.codename;
    for (const k of ['eol', 'support', 'extended', 'latest', 'latestDate']) {
      if (o[k] && (o.official || !e[k])) e[k] = o[k];
    }
    if (o.lts) e.lts = true;
  }
  for (const id of Object.keys(out)) {
    out[id] = out[id].sort((a, b) => compareVersions(b.version, a.version)).slice(0, KEEP);
  }
  return out;
}
