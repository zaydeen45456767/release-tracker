import { releases, families, releasePath, updated } from '../lib/data.js';
import { isIndexable } from '../lib/forecast.js';

// The day a release page last really changed: its newest evidence, or its release day.
// Accurate lastmod dates are what make search engines recrawl changed pages quickly.
function lastChanged(r) {
  const days = r.evidence.map((e) => e.date);
  if (r.status === 'released') days.push(r.date);
  return days.filter((d) => d <= updated).sort().at(-1) ?? updated;
}

// Only pages with real content are offered to search engines.
export function GET({ site }) {
  const shown = releases.filter(isIndexable);
  const famDate = (id) => shown.filter((r) => r.family === id).map(lastChanged).sort().at(-1) ?? updated;
  const urls = [
    ['/', updated],
    ['/track-record/', updated],
    ['/about/', updated],
    ...families.map((f) => [`/${f.id}/`, famDate(f.id)]),
    ...shown.map((r) => [releasePath(r), lastChanged(r)]),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${new URL(u, site).href}</loc><lastmod>${d}</lastmod></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
