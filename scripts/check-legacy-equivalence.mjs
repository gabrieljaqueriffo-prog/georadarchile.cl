import { writeFile } from 'node:fs/promises';
const paths = ['/industrias', '/industrias/mineria', '/industrias/construccion', '/mineria', '/construccion', '/blog/hashtags/Georadar', '/blog/tags/geo-radar'];
const rows = [];
for (const path of paths) {
  const response = await fetch('https://www.georadarchile.cl' + path, { signal: AbortSignal.timeout(20000) });
  const html = await response.text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const text = main.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  rows.push({ path, status: response.status, title: html.match(/<title>([\s\S]*?)<\/title>/i)?.[1], text });
}
const root = rows.find(r => r.path === '/industrias');
const tag = rows.find(r => r.path === '/blog/tags/geo-radar');
const report = { checkedAt: new Date().toISOString(), method: 'HTTP SSR main text, no browser DOM; comparison of content before selecting redirects', rows, equivalence: rows.map(r => ({ path: r.path, sameAsIndustries: !!r.text && r.text === root.text, sameAsTag: !!r.text && r.text === tag.text })) };
await writeFile('docs/migration/legacy-equivalence-2026-10-26.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ equivalence: report.equivalence, summaries: rows.map(r => ({ path: r.path, status: r.status, title: r.title, textLength: r.text.length, sample: r.text.slice(0, 400) })) }, null, 2));
