import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Read-only network audit. Does not deploy or modify either website.
const origin = 'https://www.georadarchile.cl';
const routes = JSON.parse(await readFile(new URL('../src/_data/routes.json', import.meta.url)));
const redirects = JSON.parse(await readFile(new URL('../src/_data/redirects.json', import.meta.url)));
const normalize = path => decodeURIComponent(path).replace(/\/+$/, '') || '/';
const known = new Set(['/', ...routes.map(r => normalize(r.url))]);
const mapping = new Map(redirects.map(r => [normalize(r.from), r.to]));
const visited = new Set();
const urls = new Set();
async function sitemap(url) {
  if (visited.has(url)) return;
  if (new URL(url).origin !== origin) throw new Error(`Unexpected sitemap host: ${url}`);
  visited.add(url);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const xml = await response.text();
  const locations = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => m[1].replaceAll('&amp;', '&'));
  if (!locations.length) throw new Error(`Empty or unsupported sitemap: ${url}`);
  if (/<sitemapindex\b/.test(xml)) {
    for (const location of locations) await sitemap(location);
  } else if (/<urlset\b/.test(xml)) {
    for (const location of locations) urls.add(location);
  } else throw new Error(`Unsupported sitemap: ${url}`);
}
await sitemap(`${origin}/sitemap.xml`);
const inventory = [...urls].sort().map(url => {
  const path = normalize(new URL(url).pathname);
  const target = mapping.get(path);
  return { url, path, status: known.has(path) ? 'preserved' : target && known.has(normalize(target)) ? 'redirected' : 'MISSING', target: known.has(path) ? path : target || null };
});
const report = { checkedAt: new Date().toISOString(), scope: 'Current Wix sitemaps only; excludes URLs known only to Search Console, backlinks or logs. Slash normalization here does not verify HTTP redirects.', sitemaps: [...visited], total: inventory.length, missing: inventory.filter(r => r.status === 'MISSING'), inventory };
await mkdir(new URL('../docs/migration/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/migration/live-url-inventory.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ total: report.total, missing: report.missing, report: 'docs/migration/live-url-inventory.json' }, null, 2));
if (report.missing.length) process.exitCode = 1;
