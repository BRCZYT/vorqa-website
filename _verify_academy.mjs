import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });

for (const [lang, path] of [['tr','/tr/akademi/'],['en','/en/academy/'],['ar','/ar/academy/']]) {
  const resp = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
  const navLinks = await page.$$eval('.nav-links a', els => els.map(e => ({text: e.textContent.trim(), href: e.getAttribute('href')})));
  console.log(`--- ${lang} ---`, 'status:', resp.status(), JSON.stringify(navLinks));
}
console.log('=== ERRORS ===');
console.log(errors.length ? [...new Set(errors)].join('\n') : 'none');
await browser.close();
