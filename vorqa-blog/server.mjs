import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS_DIR  = path.join(__dirname, 'drafts');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const PANEL_DIR   = path.join(__dirname, 'panel');

if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });

// ─── Config helpers ───────────────────────────────────────────────────────────

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

// ─── Sector rotation ──────────────────────────────────────────────────────────

function getTodaySectors() {
  const cfg = readConfig();
  const today = new Date().toISOString().slice(0, 10);

  if (cfg.last_run_date === today && Array.isArray(cfg.today_sectors) && cfg.today_sectors.length) {
    return cfg.today_sectors;
  }

  // Rotate: pick 2 consecutive sectors based on day-of-year
  const dayIndex = Math.floor(Date.now() / 86400000) % cfg.rotation.length;
  const s1 = cfg.rotation[dayIndex % cfg.rotation.length];
  const s2 = cfg.rotation[(dayIndex + 1) % cfg.rotation.length];

  cfg.last_run_date = today;
  cfg.today_sectors = [s1, s2];
  writeConfig(cfg);
  return [s1, s2];
}

// ─── Draft helpers ────────────────────────────────────────────────────────────

async function listDrafts() {
  if (!fs.existsSync(DRAFTS_DIR)) return [];
  const files = (await fsp.readdir(DRAFTS_DIR)).filter(f => f.endsWith('.json'));
  const drafts = [];
  for (const f of files) {
    try {
      const d = JSON.parse(await fsp.readFile(path.join(DRAFTS_DIR, f), 'utf8'));
      drafts.push({
        id: d.id, title: d.title, sector: d.sector,
        category_label: d.category_label, generated_at: d.generated_at,
        status: d.status, reading_time: d.reading_time,
        news_count: d.news_count, papers_count: d.papers_count
      });
    } catch { /* skip malformed */ }
  }
  return drafts.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, msg, status = 500) {
  sendJSON(res, { error: msg }, status);
}

async function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.json': 'application/json'
  };
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
  res.end(await fsp.readFile(filePath));
}

// ─── Generation (runs in background) ─────────────────────────────────────────

let generating = false;
let generateLog = [];

async function runGeneration() {
  if (generating) return;
  generating = true;
  generateLog = [];

  const sectors = getTodaySectors();
  generateLog.push(`Bugünkü sektörler: ${sectors.join(', ')}`);

  // Lazy-import generators (avoid loading at startup if API key missing)
  const { fetchSectorNews }    = await import('./generator/rss-fetch.mjs');
  const { fetchAcademicPapers } = await import('./generator/academic.mjs');
  const { generateDraft }      = await import('./generator/mira.mjs');

  for (const sector of sectors) {
    generateLog.push(`[${sector}] Kaynaklar alınıyor...`);
    try {
      const [news, papers] = await Promise.all([
        fetchSectorNews(sector),
        fetchAcademicPapers(sector)
      ]);
      generateLog.push(`[${sector}] ${news.length} haber, ${papers.length} akademik kaynak`);
      generateLog.push(`[${sector}] Mira yazıyor...`);

      const draft = await generateDraft(sector, news, papers);
      const draftPath = path.join(DRAFTS_DIR, `${draft.id}.json`);
      await fsp.writeFile(draftPath, JSON.stringify(draft, null, 2), 'utf8');
      generateLog.push(`[${sector}] ✓ Taslak hazır: ${draft.title?.slice(0, 50)}...`);
    } catch (e) {
      generateLog.push(`[${sector}] ✗ Hata: ${e.message}`);
      console.error(`[Mira] Error for ${sector}:`, e.message);
    }
  }

  generating = false;
  generateLog.push('Tamamlandı.');
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function router(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');
  const { pathname, searchParams } = urlObj;
  const method = req.method.toUpperCase();

  // Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  // ── API ──────────────────────────────────────────────────────────────────────

  // GET /api/generate — trigger generation
  if (pathname === '/api/generate' && method === 'GET') {
    if (generating) return sendJSON(res, { status: 'already_running', log: generateLog });
    sendJSON(res, { status: 'started', sectors: getTodaySectors() });
    runGeneration().catch(e => console.error('[Generate]', e));
    return;
  }

  // GET /api/status
  if (pathname === '/api/status' && method === 'GET') {
    const cfg = readConfig();
    const drafts = await listDrafts();
    return sendJSON(res, {
      generating,
      log: generateLog,
      last_run: cfg.last_run_date,
      today_sectors: cfg.today_sectors || [],
      drafts_total: drafts.length,
      drafts_pending: drafts.filter(d => d.status === 'draft').length
    });
  }

  // GET /api/drafts — list all drafts
  if (pathname === '/api/drafts' && method === 'GET') {
    return sendJSON(res, await listDrafts());
  }

  // GET /api/drafts/:id — get one draft (full)
  if (pathname.startsWith('/api/drafts/') && method === 'GET') {
    const id = decodeURIComponent(pathname.slice('/api/drafts/'.length));
    const fp = path.join(DRAFTS_DIR, `${id}.json`);
    if (!fs.existsSync(fp)) return sendError(res, 'Taslak bulunamadı', 404);
    return sendJSON(res, JSON.parse(await fsp.readFile(fp, 'utf8')));
  }

  // POST /api/approve/:id — approve and publish
  if (pathname.startsWith('/api/approve/') && method === 'POST') {
    const id = decodeURIComponent(pathname.slice('/api/approve/'.length));
    const fp = path.join(DRAFTS_DIR, `${id}.json`);
    if (!fs.existsSync(fp)) return sendError(res, 'Taslak bulunamadı', 404);
    try {
      const { publishDraft } = await import('./generator/publisher.mjs');
      const draft = JSON.parse(await fsp.readFile(fp, 'utf8'));
      const postPath = await publishDraft(draft);
      draft.status = 'published';
      draft.published_at = new Date().toISOString();
      draft.post_path = postPath;
      await fsp.writeFile(fp, JSON.stringify(draft, null, 2), 'utf8');
      return sendJSON(res, { success: true, path: postPath, url: `http://localhost:3000/${postPath}` });
    } catch (e) {
      console.error('[Approve]', e);
      return sendError(res, e.message);
    }
  }

  // DELETE /api/reject/:id — reject draft
  if (pathname.startsWith('/api/reject/') && (method === 'DELETE' || method === 'POST')) {
    const id = decodeURIComponent(pathname.slice('/api/reject/'.length));
    const fp = path.join(DRAFTS_DIR, `${id}.json`);
    if (fs.existsSync(fp)) await fsp.unlink(fp);
    return sendJSON(res, { success: true });
  }

  // GET /api/log — get generation log
  if (pathname === '/api/log' && method === 'GET') {
    return sendJSON(res, { generating, log: generateLog });
  }

  // ── Static panel files ───────────────────────────────────────────────────────

  if (pathname === '/' || pathname === '/panel' || pathname === '/panel/') {
    const fp = path.join(PANEL_DIR, 'index.html');
    if (fs.existsSync(fp)) return sendFile(res, fp);
  }

  // Serve other panel static assets
  const staticPath = path.join(PANEL_DIR, pathname.replace(/^\/panel/, ''));
  if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
    return sendFile(res, staticPath);
  }

  sendError(res, 'Sayfa bulunamadı', 404);
}

// ─── Start ────────────────────────────────────────────────────────────────────

const cfg = readConfig();
const PORT = cfg.port || 3001;

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (e) {
    console.error('[Server]', e);
    if (!res.headersSent) sendError(res, 'Internal server error', 500);
  }
});

server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║                                          ║');
  console.log(`║   🤖  Mira Blog Generator                ║`);
  console.log(`║   Panel: http://localhost:${PORT}           ║`);
  console.log('║                                          ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log('  Yeni içerik üretmek için paneli açın.');
  console.log(`  Sitede önizleme: http://localhost:3000\n`);

  // Validate API key format
  if (!cfg.gemini_api_key || cfg.gemini_api_key.startsWith('AQ.')) {
    console.warn('⚠️  UYARI: Gemini API key geçersiz görünüyor.');
    console.warn('   config.json dosyasındaki "gemini_api_key" alanını güncelleyin.');
    console.warn('   Geçerli key formatı: AIzaSy... (https://aistudio.google.com/app/apikey)\n');
  }
});
