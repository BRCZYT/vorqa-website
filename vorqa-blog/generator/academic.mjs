import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sources = JSON.parse(readFileSync(path.join(__dirname, 'sources.json'), 'utf8'));

async function fetchSemanticScholar(query) {
  const q = encodeURIComponent(query);
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${q}&limit=3&fields=title,abstract,year,authors,externalIds`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ZYT-Mira-Academic/1.0' },
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map(p => ({
      source: 'Semantic Scholar',
      title: p.title || '',
      abstract: (p.abstract || '').slice(0, 350),
      year: p.year || '',
      authors: (p.authors || []).slice(0, 3).map(a => a.name).join(', '),
      doi: p.externalIds?.DOI || ''
    }));
  } catch (e) {
    console.error('[Scholar]', e.message);
    return [];
  }
}

async function fetchArxiv(query) {
  const q = encodeURIComponent(query);
  const url = `https://export.arxiv.org/api/query?search_query=all:${q}&start=0&max_results=2&sortBy=submittedDate&sortOrder=descending`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const rx = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    while ((m = rx.exec(xml)) !== null) {
      const e = m[1];
      const title = e.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim() || '';
      const summary = e.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, ' ').trim().slice(0, 350) || '';
      const published = e.match(/<published>(.*?)<\/published>/)?.[1]?.slice(0, 10) || '';
      const authorM = [...e.matchAll(/<name>(.*?)<\/name>/g)].map(a => a[1]).slice(0, 2).join(', ');
      if (title) items.push({ source: 'arXiv', title, abstract: summary, year: published.slice(0, 4), authors: authorM });
    }
    return items;
  } catch (e) {
    console.error('[arXiv]', e.message);
    return [];
  }
}

export async function fetchAcademicPapers(sector) {
  const src = sources[sector];
  if (!src) return [];
  const [scholar, arxiv] = await Promise.all([
    fetchSemanticScholar(src.scholar || ''),
    fetchArxiv(src.arxiv || '')
  ]);
  return [...scholar, ...arxiv].slice(0, 4);
}
