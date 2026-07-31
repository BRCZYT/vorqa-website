import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function cfg() {
  return JSON.parse(readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
}

// Kesik JSON'u onarmaya çalışır (token limit aşımı durumunda)
function repairAndParse(raw) {
  let str = raw.match(/\{[\s\S]*/)?.[0] || raw;

  // body_html kesikse, açık string'i kapat
  // Açık çift tırnak sayısını say (escaped olmayanlar)
  let inString = false;
  let lastKey = '';
  let repaired = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' && str[i - 1] !== '\\') inString = !inString;
    repaired += ch;
  }

  // Eğer string içindeyse kapat
  if (inString) repaired += '"';

  // Açık array varsa kapat
  const openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
  for (let i = 0; i < openBrackets; i++) repaired += ']';

  // Açık obje varsa kapat
  const openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
  for (let i = 0; i < openBraces; i++) repaired += '}';

  // Sondaki virgülü temizle
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  return JSON.parse(repaired);
}

const SECTOR_META = {
  galvaniz: { label: 'ZYT Galvaniz', page: 'galvaniz.html' },
  beton:    { label: 'ZYT Beton',    page: 'beton.html' },
  enerji:   { label: 'ZYT Enerji',   page: 'enerji.html' },
  tedarik:  { label: 'ZYT Tedarik',  page: 'tedarik-zinciri.html' },
  makina:   { label: 'ZYT Makina',   page: 'atik-donusum.html' }
};

export async function generateDraft(sector, news, papers) {
  const config = cfg();
  const meta = SECTOR_META[sector] || { label: sector, page: 'index.html' };

  const newsBlock = news.length
    ? news.map((n, i) =>
        `[H${i + 1}] ${n.title}\nKaynak: ${n.source} | ${n.pubDate?.slice(0, 16) || ''}\n${n.description}`
      ).join('\n\n')
    : 'Bu sektörde güncel haber alınamadı.';

  const papersBlock = papers.length
    ? papers.map((p, i) =>
        `[A${i + 1}] "${p.title}"\nYazarlar: ${p.authors || 'bilinmiyor'} | ${p.year} | ${p.source}\n${p.abstract}`
      ).join('\n\n')
    : 'Akademik kaynak alınamadı.';

  const today = new Date().toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' });

  const prompt = `Sen Mira — ZYT Global Industry'nin yapay zeka blog editörüsün.
Bugün: ${today} | Sektör: ${meta.label}

Aşağıdaki kaynakları analiz et ve ZYT Akademi için Türkçe blog yazısı hazırla.

═══ HABERLER ═══
${newsBlock}

═══ AKADEMİK ═══
${papersBlock}

═══ KURALLAR ═══
• Başlık: max 85 karakter, SEO odaklı
• Meta description: 150-160 karakter
• Excerpt: 2 cümle
• body_html: TAM OLARAK 3 adet <h2> bölümü, her biri 2-3 <p>. Toplam 350-450 kelime. Tablo EKLEME.
• Referanslar: max 4 kaynak, kısa
• cover_keyword: 3 İngilizce kelime
• reading_time: rakam

KRİTİK: body_html içinde çift tırnak (") kullanma, tek tırnak (') kullan.
KRİTİK: body_html içinde ters eğik çizgi kullanma.
KRİTİK: Yanıt SADECE geçerli JSON olmalı, başka hiçbir metin olmamalı.

{"title":"...","meta_description":"...","excerpt":"...","body_html":"<h2>...</h2><p>...</p>","references":["1. ..."],"cover_keyword":"...","reading_time":6}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.5-flash'}:generateContent?key=${config.gemini_api_key}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  };

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000)
    });
  } catch (e) {
    throw new Error(`Gemini bağlantı hatası: ${e.message}`);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const finishReason = data.candidates?.[0]?.finishReason || 'unknown';
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!rawText) {
    throw new Error(`Gemini boş yanıt. finishReason: ${finishReason}`);
  }

  let draft;
  try {
    // Extract JSON block from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawText;
    draft = JSON.parse(jsonStr);
  } catch (parseErr) {
    // Try to repair truncated JSON: close any open strings/objects
    try {
      draft = repairAndParse(rawText);
    } catch (repairErr) {
      throw new Error(`JSON parse hatası: ${parseErr.message} | finishReason: ${finishReason}\nHam yanıt (ilk 300): ${rawText.slice(0, 300)}`);
    }
  }

  // Enrich with metadata
  draft.sector = sector;
  draft.category_label = meta.label;
  draft.sector_page = meta.page;
  draft.generated_at = new Date().toISOString();
  draft.id = `${sector}-${Date.now()}`;
  draft.status = 'draft';
  draft.news_count = news.length;
  draft.papers_count = papers.length;

  return draft;
}
