import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });

const slugs = [
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
for (const slug of slugs) {
  const resp = await page.goto(`http://localhost:3000/vorqa-blog/${slug}.html`, { waitUntil: 'networkidle0', timeout: 30000 });
  const navLinks = await page.$$eval('.nav-links a', els => els.map(e => ({text: e.textContent.trim(), href: e.getAttribute('href')})));
  console.log(slug.slice(0,30), '->', resp.status(), JSON.stringify(navLinks));
}
console.log('=== errors ===', errors.length ? [...new Set(errors)].join('\n') : 'none');
await browser.close();
