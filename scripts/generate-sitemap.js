#!/usr/bin/env node
/**
 * generate-sitemap.js
 * Regenerates sitemap.xml from data/games.json.
 * Run this after adding/removing games so the sitemap stays in sync.
 *
 * Usage:
 *   node scripts/generate-sitemap.js
 *   node scripts/generate-sitemap.js https://my-real-domain.com
 *
 * No dependencies — plain Node.js (fs only), works anywhere Node runs.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE_URL = (process.argv[2] || 'https://your-domain-here.com').replace(/\/$/, '');

const gamesPath = path.join(ROOT, 'data', 'games.json');
const outPath = path.join(ROOT, 'sitemap.xml');

function main() {
  const raw = fs.readFileSync(gamesPath, 'utf8');
  const { games } = JSON.parse(raw);
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    ...games.map(g => ({
      loc: `${BASE_URL}/game.html?id=${encodeURIComponent(g.id)}`,
      priority: '0.8',
      changefreq: 'daily',
    })),
  ];

  const body = urls
    .map(u => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`sitemap.xml written with ${urls.length} URLs (base: ${BASE_URL})`);
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main();
