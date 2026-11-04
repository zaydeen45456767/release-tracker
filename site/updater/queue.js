// The order in which pages should be sent to Google for indexing (Search Console "Request indexing",
// about 10 a day). Forecast pages come first, soonest date first, because they bring the traffic; released
// pages follow, newest first. Only pages search engines may index are listed. Pure: no network, no files.
import { effectiveStatus, isIndexable, sortDate } from '../src/lib/forecast.js';

export function indexQueue(releases, now) {
  const listed = releases.filter(isIndexable).map((r) => ({ r, status: effectiveStatus(r, now) }));
  const forecasts = listed.filter((x) => x.status !== 'released' && x.status !== 'missed').sort((a, b) => sortDate(a.r) - sortDate(b.r));
  const released = listed.filter((x) => x.status === 'released').sort((a, b) => sortDate(b.r) - sortDate(a.r));
  return [...forecasts, ...released].map(({ r, status }) => ({ path: `/${r.family}/${r.slug}/`, status, date: r.date ?? r.window.start }));
}
