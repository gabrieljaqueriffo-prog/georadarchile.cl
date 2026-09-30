import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../_site/", import.meta.url);
const routes = JSON.parse(await readFile(new URL("../src/_data/routes.json", import.meta.url), "utf8"));
const failures = [];

for (const route of [{ url: "/" }, ...routes]) {
  const relative = route.url === "/" ? "index.html" : join(route.url.replace(/^\/+/, ""), "index.html");
  try { await access(new URL(relative.replaceAll("\\", "/"), root)); }
  catch { failures.push(route.url); }
}

if (failures.length) {
  console.error(`Faltan ${failures.length} rutas: ${failures.join(", ")}`);
  process.exit(1);
}

console.log(`Scaffold válido: ${routes.length + 1} rutas canónicas generadas.`);
