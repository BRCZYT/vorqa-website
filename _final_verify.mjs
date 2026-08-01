import puppeteer from 'puppeteer';

const BASE = 'http://localhost:3000';
const browser = await puppeteer.launch();
const page = await browser.newPage();
const allErrors = [];

async function check(path) {
  const errors = [];
  page.removeAllListeners('pageerror');
  page.removeAllListeners('response');
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 30000 });
  const status = resp ? resp.status() : 'NO RESPONSE';
  if (errors.length) allErrors.push(`[${path}] ` + errors.join(', '));
  console.log(`${path} -> ${status}${errors.length ? ' ERRORS: ' + errors.join(', ') : ' OK'}`);
  return status;
}

console.log('=== Core pages ===');
for (const p of ['/tr/', '/en/', '/ar/', '/tr/akademi/', '/en/academy/', '/ar/academy/', '/tr/iletisim/', '/en/contact/', '/ar/contact/']) {
  await check(p);
}

console.log('=== Old deleted pages should redirect, not 404 ===');
for (const p of ['/hakkimizda.html', '/beton.html', '/galvaniz.html', '/enerji.html', '/celik-yapi-mekanik-imalat.html', '/tedarik-zinciri.html', '/referanslar.html', '/belgelerimiz.html', '/akademi.html', '/iletisim.html']) {
  await check(p);
}

console.log('=== Blog posts ===');
const blogPosts = [
  'beton-santrali-kapasite-hesaplama-2026-05-10',
  'iso-1461-galvaniz-kaplama-kalinligi-2026-04-22',
  'wte-atiktan-enerjiye-teknolojiler-2026-04-08',
  'en-1090-2-celik-yapi-toleranslari-ndt-2026-03-20',
  'tedarik-zinciri-2026-kirilganliklari-2026-03-05',
  'mobil-sabit-beton-santrali-roi-2026-02-14',
  'epc-yonetimi-kazanilmis-deger-risk-2026-01-28',
  'enerji-sektorunde-epc-f-modeli-ve-yapay-zeka-gelecegin-projelerin-2026-05-28',
  'mekanik-montaj-titresim-analizi-hizalama-2026-06-11',
  'galvaniz-boya-kaplama-yasam-dongusu-maliyeti-2026-06-25',
];
for (const slug of blogPosts) {
  await check(`/vorqa-blog/${slug}.html`);
}

console.log('=== Lang switcher check (EN homepage) ===');
await page.goto(BASE + '/en/', { waitUntil: 'networkidle0' });
const langLinks = await page.$$eval('.lang-sw a', els => els.map(e => e.getAttribute('href')));
console.log('lang-sw hrefs:', langLinks);

console.log('=== Nav check (EN homepage) ===');
const navLinks = await page.$$eval('.nav-links a', els => els.map(e => ({text:e.textContent.trim(), href:e.getAttribute('href')})));
console.log(JSON.stringify(navLinks));

console.log('\n=== TOTAL ERROR SUMMARY ===');
console.log(allErrors.length ? allErrors.join('\n') : 'NONE — all clean');

await browser.close();
