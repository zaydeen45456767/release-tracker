// Checks every outside link in the built site (dist/) and lists the ones that fail.
//   npm run build && npm run check-links
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
// Sites that answer bots with a challenge or 403 even though the page works in a browser.
const BOT_WALLED = ['dl.fedoraproject.org', 'docs.fedoraproject.org', 'lubuntu.me', 'wiki.debian.org'];

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const links = new Map();
for (const f of await htmlFiles(DIST)) {
  for (const m of (await readFile(f, 'utf8')).matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    if (m[1].includes('example.com') || m[1].includes('fonts.g')) continue;
    if (!links.has(m[1])) links.set(m[1], new Set());
    links.get(m[1]).add(f.slice(DIST.length - 1).replace(/index\.html$/, ''));
  }
}

async function check(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 linux-release-tracker-linkcheck' }, signal: AbortSignal.timeout(30000) });
    return res.status;
  } catch (e) {
    return e.name === 'TimeoutError' ? 'timeout' : 'error';
  }
}

const urls = [...links.keys()];
const bad = [];
for (let i = 0; i < urls.length; i += 8) {
  const batch = urls.slice(i, i + 8);
  const codes = await Promise.all(batch.map(check));
  batch.forEach((u, j) => {
    const walled = BOT_WALLED.includes(new URL(u).hostname);
    if (codes[j] !== 200 && !walled) bad.push(`${codes[j]} ${u} (on ${[...links.get(u)].slice(0, 3).join(', ')})`);
  });
}
console.log(`Checked ${urls.length} outside links.`);
console.log(bad.length ? `Broken or unreachable:\n  - ${bad.join('\n  - ')}` : 'All links work.');
process.exitCode = bad.length ? 1 : 0;
