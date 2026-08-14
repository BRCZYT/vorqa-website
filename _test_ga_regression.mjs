import puppeteer from 'puppeteer';

const pages = [
  '/tr/index.html', '/tr/akademi/index.html', '/tr/iletisim/index.html',
  '/en/index.html', '/en/academy/index.html', '/en/contact/index.html',
  '/ar/index.html', '/ar/academy/index.html', '/ar/contact/index.html',
  '/vorqa-blog/iso-1461-galvaniz-kaplama-kalinligi-2026-04-22.html',
  '/vorqa-blog/wte-atiktan-enerjiye-teknolojiler-2026-04-08.html',
  '/tr/akademi/beton-santrali-kapasite-hesaplama-2026-05-10/index.html',
];

const browser = await puppeteer.launch();
let failures = 0;

for (const p of pages) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  const resp = await page.goto('http://localhost:3000' + p, { waitUntil: 'networkidle0', timeout: 30000 });
  const status = resp.status();
  const gtagLoaded = await page.evaluate(() => typeof window.gtag === 'function' && Array.isArray(window.dataLayer));
  const ok = status === 200 && errors.length === 0 && gtagLoaded;
  console.log(`${ok ? 'OK ' : 'FAIL'} ${p} status=${status} errors=${errors.length} gtagLoaded=${gtagLoaded}`);
  if (!ok) { failures++; errors.forEach(e => console.log('   ' + e)); }
  await page.close();
}

await browser.close();
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
