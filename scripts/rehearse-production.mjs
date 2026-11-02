import { cp, mkdtemp, readFile, writeFile, symlink, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// Rehearsal only: never changes source configuration or deploys the output.
const root = process.cwd();
const sandbox = await mkdtemp(join(tmpdir(), 'georadarchile-production-'));
const protectedFiles = ['src/_data/site.js', 'src/headers.njk', 'src/robots.njk', '_site/robots.txt', '_site/_headers'];
const digest = async file => createHash('sha256').update(await readFile(resolve(root, file))).digest('hex');
const before = await Promise.all(protectedFiles.map(digest));
await cp(resolve(root, 'src'), join(sandbox, 'src'), { recursive: true });
for (const file of ['package.json', 'eleventy.config.js']) await cp(resolve(root, file), join(sandbox, file));
await symlink(resolve(root, 'node_modules'), join(sandbox, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
const edit = async (file, transform) => {
  const target = join(sandbox, file);
  await writeFile(target, transform(await readFile(target, 'utf8')));
};
const env = { ...process.env, SITE_ENV: 'production', CF_PAGES_BRANCH: 'main', CONTACT_FORM_ENABLED: 'false', CONTACT_ENABLED: 'false', TURNSTILE_SITE_KEY: '' };
delete env.BASE_PATH;
execFileSync(process.execPath, [resolve(root, 'node_modules/@11ty/eleventy/cmd.cjs')], { cwd: sandbox, env, stdio: 'pipe' });
const routes = [{ url: '/' }, ...JSON.parse(await readFile(resolve(root, 'src/_data/routes.json'), 'utf8'))];
const output = file => readFile(join(sandbox, '_site', file), 'utf8');
const results = [];
for (const route of routes) {
  const html = await output(route.url.slice(1) + 'index.html');
  const robots = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/i)?.[1];
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  results.push({ path: route.url, robots, canonical, ok: robots === (route.robots || 'index,follow') && canonical === 'https://www.georadarchile.cl' + route.url });
}
const sitemap = await output('sitemap.xml');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const expected = routes.filter(r => r.url !== '/search/').map(r => 'https://www.georadarchile.cl' + r.url);
const robots = await output('robots.txt');
const headers = await output('_headers');
const errorPage = await output('404.html');
const checks = {
  sitemap: locations.length === expected.length && new Set(locations).size === expected.length && expected.every(url => locations.includes(url)),
  robots: !/^Disallow:\s*\/$/m.test(robots) && robots.includes('Sitemap: https://www.georadarchile.cl/sitemap.xml'),
  headers: !/X-Robots-Tag:.*noindex/i.test(headers),
  errorExcluded: /name="robots" content="noindex,nofollow"/.test(errorPage),
  sourceAndStagingUntouched: (await Promise.all(protectedFiles.map(digest))).every((hash, i) => hash === before[i])
};
execFileSync(process.execPath, [resolve(root, 'node_modules/@11ty/eleventy/cmd.cjs')], { cwd: sandbox, env: { ...env, CF_PAGES_BRANCH: 'preview-check' }, stdio: 'pipe' });
checks.previewBlocked = /content="noindex,nofollow"/.test(await output('index.html')) && /X-Robots-Tag: noindex, nofollow/.test(await output('_headers')) && /Disallow: \//.test(await output('robots.txt'));
const report = { checkedAt: new Date().toISOString(), sandbox, published: false, contactSendingEnabled: false, transformations: ['SITE_ENV=production and CF_PAGES_BRANCH=main in isolated copy', 'feature-branch preview isolation checked with production flag inherited'], checks, sitemapCount: locations.length, results };
await mkdir('docs/migration/release-2026-10-29', { recursive: true });
await writeFile('docs/migration/release-2026-10-29/production-rehearsal.json', JSON.stringify(report, null, 2));
const passed = Object.values(checks).every(Boolean) && results.every(r => r.ok);
console.log(JSON.stringify({ passed, checks, routes: results.length, sitemapCount: locations.length, failures: results.filter(r => !r.ok), sandbox }, null, 2));
process.exitCode = passed ? 0 : 1;
