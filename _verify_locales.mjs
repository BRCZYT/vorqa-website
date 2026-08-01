import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });

for (const lang of ['tr','en','ar']) {
  const resp = await page.goto(`http://localhost:3000/${lang}/`, { waitUntil: 'networkidle0', timeout: 30000 });
  const htmlLang = await page.$eval('html', el => el.getAttribute('lang'));
  const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
  const h1 = await page.$eval('.hero-h1', el => el.textContent.trim());
  const navLinks = await page.$$eval('.lang-sw a, .lang-sw button', els => els.map(e => ({tag: e.tagName, href: e.getAttribute('href'), lang: e.dataset.lang})));
  console.log(`--- ${lang} ---`);
  console.log('status:', resp.status(), 'html[lang]:', htmlLang, 'dir:', htmlDir);
  console.log('h1:', h1.slice(0,50));
  console.log('lang-sw elements:', JSON.stringify(navLinks));
}

console.log('=== ERRORS ===');
console.log(errors.length ? [...new Set(errors)].join('\n') : 'none');
await browser.close();
