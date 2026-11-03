// Tells Bing, Yandex and others (IndexNow) which pages exist, using the built sitemap.
// Run after a data change has been pushed and the site has had time to rebuild.
import { readFileSync } from 'node:fs';

const key = '4f1c91add7b000a93a3bef30c386ef5f';
const site = process.env.SITE_URL;
if (!site) {
  console.log('SITE_URL is not set, skipping IndexNow.');
  process.exit(0);
}

const xml = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const host = new URL(site).host;

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs submitted, HTTP ${res.status}`);
