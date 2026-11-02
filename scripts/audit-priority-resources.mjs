import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const dir = 'docs/migration/priority-audit-2026-10-26';
const evidence = JSON.parse(await readFile(`${dir}/evidence.json`, 'utf8'));
const redirects = JSON.parse(await readFile('src/_data/redirects.json', 'utf8'));
const staging = 'https://georadarchile-cl.pages.dev';
const assets = new Set();
const missingLocal = [];
const checks = [];
for (const page of evidence.pages.filter(p => p.clicks || p.backlinks)) {
  for (const image of page.local.images || []) {
    if (image.src) assets.add(new URL(image.src, staging).href);
    for (const candidate of (image.srcset || '').split(',')) {
      const path = candidate.trim().split(/\s+/)[0];
      if (path) assets.add(new URL(path, staging).href);
    }
  }
  for (const href of page.local.links || []) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const path = decodeURIComponent(href.split(/[?#]/)[0]);
    const file = resolve('_site', '.' + path, path.endsWith('/') ? 'index.html' : '');
    try { await access(file); } catch { missingLocal.push({ page: page.path, href }); }
  }
}
for (const asset of assets) {
  const url = new URL(asset);
  if (url.origin !== staging) continue;
  try { await access(resolve('_site', '.' + decodeURIComponent(url.pathname))); }
  catch { missingLocal.push({ asset }); }
  checks.push({ kind: 'asset', url: asset, method: 'HEAD' });
}
for (const r of redirects) for (const suffix of ['', '/']) checks.push({ kind: 'redirect', url: staging + r.from + suffix, expected: r.to, method: 'GET' });
let cursor = 0;
const results = [];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < checks.length) {
    const check = checks[cursor++];
    try {
      const response = await fetch(check.url, { method: check.method, redirect: 'manual', signal: AbortSignal.timeout(20000) });
      const location = response.headers.get('location');
      const ok = check.kind === 'asset' ? response.status === 200 : response.status === 301 && location && decodeURI(new URL(location, staging).pathname) === decodeURI(check.expected);
      results.push({ ...check, status: response.status, location, ok: Boolean(ok) });
      await response.body?.cancel();
    } catch (error) { results.push({ ...check, error: error.message, ok: false }); }
  }
}));
const report = { checkedAt: new Date().toISOString(), missingLocal, results };
await writeFile(`${dir}/resources.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ assets: assets.size, redirects: results.filter(r => r.kind === 'redirect').length, missingLocal, failures: results.filter(r => !r.ok) }, null, 2));
