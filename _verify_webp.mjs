import puppeteer from 'puppeteer';
const base = 'http://localhost:3000';
const pages = ['/tr/', '/en/', '/ar/', '/tr/akademi/', '/en/academy/', '/ar/academy/', '/tr/iletisim/', '/en/contact/', '/ar/contact/'];
const browser = await puppeteer.launch({ headless: 'new' });
let allOk = true;

for (const path of pages) {
  const page = await browser.newPage();
  const failed = [];
  const consoleErrors = [];
  page.on('response', (res) => { if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`); });
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  const resp = await page.goto(base + path, { waitUntil: 'networkidle0', timeout: 30000 });
  console.log(`[${path}] status=${resp.status()}`);
  if (failed.length) { allOk = false; console.log('  BROKEN:', failed); }
  if (consoleErrors.length) { allOk = false; console.log('  ERRORS:', consoleErrors); }
  await page.close();
}

const page = await browser.newPage();
await page.goto(base + '/en/', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('#showroom-how').scrollIntoView());
const results = await page.evaluate(async () => {
  const imgs = Array.from(document.querySelectorAll('#sr-track-1 .sr-card img, #sr-track-2 .sr-card img'));
  const out = [];
  for (const img of imgs) {
    img.loading = 'eager';
    try { await img.decode(); } catch(e) { out.push({src: img.src, error: e.message}); continue; }
    out.push({src: img.src.split('/').pop(), w: img.naturalWidth});
  }
  return out;
});
const uniq = {};
results.forEach(r => uniq[r.src] = r);
console.log('unique decoded images:', Object.keys(uniq).length);
console.log(JSON.stringify(uniq, null, 2));
if (Object.keys(uniq).length !== 8 || Object.values(uniq).some(r => !r.w || r.w === 0)) { allOk = false; console.log('  IMAGE DECODE ISSUE'); }
if (!Object.keys(uniq).every(k => k.endsWith('.webp'))) { allOk = false; console.log('  NON-WEBP REFERENCE FOUND'); }
await page.close();

await browser.close();
console.log(allOk ? '\nALL OK' : '\nISSUES FOUND');
process.exit(allOk ? 0 : 1);
