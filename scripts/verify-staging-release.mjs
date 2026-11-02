import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'https://georadarchile-cl.pages.dev';
const routes = JSON.parse(await readFile('src/_data/routes.json', 'utf8'));
const redirects = JSON.parse(await readFile('src/_data/redirects.json', 'utf8'));
const paths = [...new Set(['/', ...routes.map(r => r.url)])];
const main = html => (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
const hash = value => createHash('sha256').update(value).digest('hex');
// Only the three known public build settings may differ on contact.
const contactMain = html => main(html)
  .replace('data-contact-enabled="true"', 'data-contact-enabled="false"')
  .replace(/<div data-turnstile="" data-sitekey="[^"]*"><\/div>/, '')
  .replace('Complete los antecedentes y la verificación de seguridad para enviar.', 'El envío por formulario todavía no está disponible. Escríbanos a gabriel@georadarchile.cl o por WhatsApp.');
const results = [];
async function request(path, redirect = 'follow') {
  return fetch(new URL(path, base), { redirect, signal: AbortSignal.timeout(20000) });
}
for (let i = 0; i < paths.length; i += 5) {
  await Promise.all(paths.slice(i, i + 5).map(async path => {
    try {
      const response = await request(path);
      const html = await response.text();
      const local = await readFile('_site' + decodeURIComponent(path) + 'index.html', 'utf8');
      const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
      const robots = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/i)?.[1];
      const row = { kind: 'page', path, status: response.status, canonical, robots, header: response.headers.get('x-robots-tag'), h1: (html.match(/<h1\b/gi) || []).length, mainMatchesLocal: !!main(html) && hash(main(html)) === hash(main(local)) };
      if (path === '/contacto/') row.publicBuildSettingsOnly = !!main(html) && contactMain(html) === contactMain(local);
      row.ok = row.status === 200 && row.canonical === 'https://www.georadarchile.cl' + path && /noindex/.test(row.robots || '') && /noindex/.test(row.header || '') && row.h1 === 1 && (row.mainMatchesLocal || row.publicBuildSettingsOnly === true);
      results.push(row);
    } catch (error) { results.push({ kind: 'page', path, ok: false, error: error.message }); }
  }));
}
const variants = redirects.flatMap(r => ['', '/'].map(suffix => ({ path: r.from + suffix, to: r.to })));
for (let i = 0; i < variants.length; i += 6) {
  await Promise.all(variants.slice(i, i + 6).map(async ({ path, to }) => {
    try {
      const response = await request(path, 'manual');
      const location = response.headers.get('location');
      results.push({ kind: 'redirect', path, status: response.status, location, expected: to, ok: response.status === 301 && new URL(location || '', base).href === new URL(to, base).href });
    } catch (error) { results.push({ kind: 'redirect', path, ok: false, error: error.message }); }
  }));
}
const missing = await request('/migration-check-nonexistent-20261029/');
results.push({ kind: '404', status: missing.status, ok: missing.status === 404 });
const report = { checkedAt: new Date().toISOString(), base, scope: 'HTTP and SSR main comparison; no email sent; not full visual or editorial parity', results };
await mkdir('docs/migration/release-2026-10-29', { recursive: true });
await writeFile('docs/migration/release-2026-10-29/http-audit-latest.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pages: paths.length, redirects: variants.length, failures: results.filter(r => !r.ok) }, null, 2));
process.exitCode = results.some(r => !r.ok) ? 1 : 0;
