import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sources = JSON.parse(readFileSync(path.join(__dirname, 'sources.json'), 'utf8'));

function parseRssItems(xml) {
  const items = [];
  const rx = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = rx.exec(xml)) !== null) {
    const raw = m[1];
    const title =
      raw.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1] ||
      raw.match(/<title>(.*?)<\/title>/s)?.[1] || '';
    const link =
      raw.match(/<link>(.*?)<\/link>/s)?.[1] || '';
    const desc =
      raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/s)?.[1] ||
      raw.match(/<description>([\s\S]*?)<\/description>/s)?.[1] || '';
    const pubDate =
      raw.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] || '';
    const source =
      raw.match(/<source[^>]*>(.*?)<\/source>/s)?.[1] || 'Google News';

    const cleanDesc = desc.replace(/<[^>]+>/g, '').trim().slice(0, 250);
    if (title.trim()) {
      items.push({ title: title.trim(), link, description: cleanDesc, pubDate, source });
    }
    if (items.length >= 5) break;
  }
  return items;
}

export async function fetchSectorNews(sector) {
  const src = sources[sector];
  if (!src) return [];

  const urls = [src.rss, src.rss_en].filter(Boolean);
  const allItems = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (ZYT Mira Bot/1.0)' },
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRssItems(xml);
      allItems.push(...items);
      if (allItems.length >= 5) break;
    } catch (e) {
      console.error(`[RSS] ${sector} (${url}):`, e.message);
    }
  }

  return allItems.slice(0, 5);
}
