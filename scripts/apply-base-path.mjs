import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const basePath = (process.env.BASE_PATH || "").replace(/\/+$/, "");
if (!basePath) process.exit(0);

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(html|css|js)$/.test(entry.name)) await rewrite(file);
  }
}

async function rewrite(file) {
  const original = await readFile(file, "utf8");
  const rewritten = original
    .replace(/((?:href|src|action)=["'])\/(?!\/)/g, `$1${basePath}/`)
    .replace(/((?:srcset|imagesrcset)=["'])([^"']+)(["'])/g, (_, prefix, value, suffix) => `${prefix}${value.replace(/(^|,\s*)\/(?!\/)/g, `$1${basePath}/`)}${suffix}`)
    .replace(/(url\(\s*["']?)\/(?!\/)/g, `$1${basePath}/`)
    .replace(/(url=)\/(?!\/)/g, `$1${basePath}/`)
    .replace(/(location\.replace\(\s*["'])\/(?!\/)/g, `$1${basePath}/`);
  if (rewritten !== original) await writeFile(file, rewritten);
}

await walk("_site");
console.log(`Base path aplicado: ${basePath}`);
