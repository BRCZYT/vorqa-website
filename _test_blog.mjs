import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const posts = [
  'beton-santrali-kapasite-hesaplama-2026-05-10',
  'en-1090-2-celik-yapi-toleranslari-ndt-2026-03-20',
  'enerji-sektorunde-epc-f-modeli-ve-yapay-zeka-gelecegin-projelerin-2026-05-28',
  'epc-yonetimi-kazanilmis-deger-risk-2026-01-28',
  'galvaniz-boya-kaplama-yasam-dongusu-maliyeti-2026-06-25',
  'iso-1461-galvaniz-kaplama-kalinligi-2026-04-22',
  'mekanik-montaj-titresim-analizi-hizalama-2026-06-11',
  'mobil-sabit-beton-santrali-roi-2026-02-14',
  'tedarik-zinciri-2026-kirilganliklari-2026-03-05',
  'wte-atiktan-enerjiye-teknolojiler-2026-04-08',
];

for (const slug of posts) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  const failed = [];
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url() + ' HTTP ' + r.status()); });
  const resp = await page.goto(`http://localhost:3000/vorqa-blog/${slug}.html`, { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(r => setTimeout(r, 800));
  const data = await page.evaluate(() => {
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => {
      try { return JSON.parse(s.textContent); } catch (e) { return 'INVALID: ' + e.message; }
    });
    return {
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
      imgsBroken: [...document.querySelectorAll('img')].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src),
      jsonLd,
    };
  });
  console.log(`\n=== ${slug} ===`);
  console.log('status:', resp.status());
  console.log('title:', data.title);
  console.log('canonical:', data.canonical);
  console.log('ogTitle:', data.ogTitle);
  console.log('h1:', data.h1);
  console.log('imgsBroken:', data.imgsBroken);
  console.log('jsonLd:', JSON.stringify(data.jsonLd));
  console.log('console errors:', errors.length ? errors : 'none');
  console.log('failed requests:', failed.length ? failed : 'none');
  await page.close();
}
await browser.close();
