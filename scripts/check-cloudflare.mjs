import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import site from '../src/_data/site.js';

const redirects = JSON.parse(await readFile('src/_data/redirects.json', 'utf8'));
const rules = (await readFile('_site/_redirects', 'utf8')).split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
assert.equal(rules.length, redirects.length * 2);
const sourcePaths = new Set();
for (const { from } of redirects) {
  for (const source of [from, `${from}/`]) {
    const path = decodeURIComponent(source);
    assert(!sourcePaths.has(path), `Origen duplicado: ${source}`);
    sourcePaths.add(path);
  }
}
for (const { from, to } of redirects) {
  assert(!sourcePaths.has(decodeURIComponent(to)), `Cadena de redirección: ${from} -> ${to}`);
  for (const source of [from, `${from}/`]) {
    assert(rules.includes(`${source} ${to} 301`), `Falta redirect: ${source}`);
    assert.notEqual(source, to, `Bucle: ${source}`);
  }
  await access(`_site${to}index.html`);
}
const headers = await readFile('_site/_headers', 'utf8');
const robots = await readFile('_site/robots.txt', 'utf8');
const home = await readFile('_site/index.html', 'utf8');
if (site.staging) {
  assert.match(headers, /X-Robots-Tag: noindex, nofollow/);
  assert.match(robots, /Disallow: \//);
  assert.match(home, /content="noindex,nofollow"/);
} else {
  assert(!/X-Robots-Tag:.*noindex/i.test(headers));
  assert(!/Disallow:\s*\//.test(robots));
  assert.match(robots, /Sitemap: https:\/\/www\.georadarchile\.cl\/sitemap.xml/);
  assert.match(home, /content="index,follow"/);
}
assert(!home.includes('href="/georadarchile.cl/'), 'Cloudflare requiere rutas desde la raíz, sin BASE_PATH');
assert(!home.includes('src="/georadarchile.cl/'), 'Los activos tienen prefijo de GitHub Pages');
console.log(`Cloudflare ${site.staging ? 'staging' : 'producción'} válido: ${rules.length} reglas 301, destinos existentes e indexación coherente.`);
