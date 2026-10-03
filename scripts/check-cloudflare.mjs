import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const redirects = JSON.parse(await readFile('src/_data/redirects.json', 'utf8'));
const rules = (await readFile('_site/_redirects', 'utf8')).split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
assert.equal(rules.length, redirects.length * 2);
for (const { from, to } of redirects) {
  for (const source of [from, `${from}/`]) {
    assert(rules.includes(`${source} ${to} 301`), `Falta redirect: ${source}`);
    assert.notEqual(source, to, `Bucle: ${source}`);
  }
  await access(`_site${to}index.html`);
}
const headers = await readFile('_site/_headers', 'utf8');
assert.match(headers, /X-Robots-Tag: noindex, nofollow/);
assert.match(await readFile('_site/robots.txt', 'utf8'), /Disallow: \//);
const home = await readFile('_site/index.html', 'utf8');
assert.match(home, /content="noindex,nofollow"/);
assert(!home.includes('href="/georadarchile.cl/'), 'Cloudflare requiere rutas desde la raíz, sin BASE_PATH');
assert(!home.includes('src="/georadarchile.cl/'), 'Los activos tienen prefijo de GitHub Pages');
console.log(`Cloudflare staging válido: ${rules.length} reglas 301, destinos existentes y noindex activo.`);
