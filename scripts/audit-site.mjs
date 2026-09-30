import { readdir, readFile, access } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

const outputRoot = resolve("_site");
const htmlFiles = [];
const findings = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}

function routeFor(file) {
  return `/${relative(outputRoot, file).replaceAll("\\", "/").replace(/index\.html$/, "")}`;
}

function count(source, expression) {
  return [...source.matchAll(expression)].length;
}

async function internalTargetExists(fromFile, href) {
  if (!href || href.startsWith("#") || /^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) return true;
  const clean = href.split(/[?#]/)[0];
  if (!clean) return true;
  const target = clean.startsWith("/") ? join(outputRoot, clean) : resolve(dirname(fromFile), clean);
  const candidates = target.endsWith(".html") ? [target] : [target, join(target, "index.html")];
  for (const candidate of candidates) {
    try { await access(candidate); return true; } catch { /* try the next representation */ }
  }
  return false;
}

await walk(outputRoot);

for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  const route = routeFor(file);
  if (route === "/vista-mobile/") continue;
  const checks = {
    h1: count(source, /<h1\b/gi),
    title: count(source, /<title>[^<]+<\/title>/gi),
    canonical: count(source, /<link\b[^>]*\brel=["']canonical["'][^>]*>/gi),
    description: count(source, /<meta\b[^>]*\bname=["']description["'][^>]*>/gi),
  };

  if (checks.h1 !== 1) findings.push(`${route}: debe tener 1 H1; tiene ${checks.h1}`);
  if (checks.title !== 1) findings.push(`${route}: debe tener 1 title; tiene ${checks.title}`);
  if (checks.canonical !== 1) findings.push(`${route}: debe tener 1 canonical; tiene ${checks.canonical}`);
  if (checks.description !== 1) findings.push(`${route}: debe tener 1 meta description; tiene ${checks.description}`);

  for (const image of source.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(image[1])) findings.push(`${route}: imagen sin atributo alt`);
  }

  for (const link of source.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    if (!await internalTargetExists(file, link[1])) findings.push(`${route}: enlace interno roto ${link[1]}`);
  }
}

if (findings.length) {
  console.error(`Auditoría transversal: ${findings.length} hallazgos.`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Auditoría transversal superada: ${htmlFiles.length} documentos revisados.`);
