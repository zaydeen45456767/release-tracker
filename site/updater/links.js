// Adds official release-notes links to pages once the project has actually published them.
// A link is only added after its server answers, so a guessed address never reaches a page.
// Looks at pages changed in this run and at pages not released yet (notes often appear at beta time).
const NOTES = {
  firefox: (r) => [
    r.status === 'released'
      ? { label: `Firefox ${r.version} release notes`, url: `https://www.mozilla.org/en-US/firefox/${r.version}.0/releasenotes/` }
      : { label: `Firefox ${r.version} beta release notes`, url: `https://www.mozilla.org/en-US/firefox/${r.version}.0beta/releasenotes/` },
  ],
  'linux-kernel': (r) => [{ label: `Linux ${r.version} on KernelNewbies`, url: `https://kernelnewbies.org/Linux_${r.version}` }],
  gnome: (r) => (r.status === 'released' ? [{ label: `GNOME ${r.version} release notes`, url: `https://release.gnome.org/${r.version}/` }] : []),
};

export async function enrichLinks(data, touched, check) {
  const changes = [];
  const ids = new Set(touched);
  for (const r of data.releases) if (r.status !== 'released') ids.add(r.id);
  for (const r of data.releases.filter((x) => ids.has(x.id) && NOTES[x.family])) {
    for (const link of NOTES[r.family](r)) {
      if (r.sources.some((s) => s.url === link.url)) continue;
      if (!(await check(link.url))) continue;
      r.sources.push(link);
      if (r.status === 'released' && !r.notes) r.notes = link;
      changes.push(`${r.id}: added ${link.label}`);
    }
  }
  return changes;
}
